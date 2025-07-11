from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Product, Manufacturer, Customer, PurchaseOrder, PurchaseOrderItem, Batch,
    SaleOrder, SaleOrderItem, InventoryTransaction, Payment, AuditLog
)
from .serializers import (
    ProductSerializer, ManufacturerSerializer, CustomerSerializer,
    PurchaseOrderSerializer, PurchaseOrderItemSerializer, BatchSerializer,
    SaleOrderSerializer, SaleOrderItemSerializer, InventoryTransactionSerializer,
    PaymentSerializer, AuditLogSerializer
)

# Product ViewSet
class ProductViewSet(viewsets.ModelViewSet):
    """CRUD for pharmaceutical products."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["name", "category", "hsn_code"]
    filterset_fields = ["is_active", "category"]

# Manufacturer ViewSet
class ManufacturerViewSet(viewsets.ModelViewSet):
    """CRUD for manufacturers."""
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "gstin"]

# Customer ViewSet
class CustomerViewSet(viewsets.ModelViewSet):
    """CRUD for customers (hospitals/distributors)."""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "gstin"]

# PurchaseOrder ViewSet
class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """CRUD for purchase orders. Supports nested creation of items."""
    queryset = PurchaseOrder.objects.all().prefetch_related('items')
    serializer_class = PurchaseOrderSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["manufacturer__name", "status"]
    filterset_fields = ["status", "manufacturer"]

    def create(self, request, *args, **kwargs):
        # Support nested creation of items
        items_data = request.data.pop('items', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purchase_order = serializer.save(created_by=request.user)
        for item in items_data:
            item['purchase_order_id'] = purchase_order.id
            item_serializer = PurchaseOrderItemSerializer(data=item)
            item_serializer.is_valid(raise_exception=True)
            item_serializer.save()
        return Response(self.get_serializer(purchase_order).data, status=status.HTTP_201_CREATED)

# PurchaseOrderItem ViewSet
class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    """CRUD for purchase order items."""
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["purchase_order", "product", "batch_number"]

# Batch ViewSet
class BatchViewSet(viewsets.ModelViewSet):
    """CRUD for product batches/lots."""
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["batch_number", "product__name"]
    filterset_fields = ["product", "status", "expiry_date"]

# SaleOrder ViewSet
class SaleOrderViewSet(viewsets.ModelViewSet):
    """CRUD for sale orders. Supports nested creation of items."""
    queryset = SaleOrder.objects.all().prefetch_related('items')
    serializer_class = SaleOrderSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["customer__name", "status"]
    filterset_fields = ["status", "customer"]

    def create(self, request, *args, **kwargs):
        # Support nested creation of items
        items_data = request.data.pop('items', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale_order = serializer.save(created_by=request.user)
        for item in items_data:
            item['sale_order_id'] = sale_order.id
            item_serializer = SaleOrderItemSerializer(data=item)
            item_serializer.is_valid(raise_exception=True)
            item_serializer.save()
        return Response(self.get_serializer(sale_order).data, status=status.HTTP_201_CREATED)

# SaleOrderItem ViewSet
class SaleOrderItemViewSet(viewsets.ModelViewSet):
    """CRUD for sale order items."""
    queryset = SaleOrderItem.objects.all()
    serializer_class = SaleOrderItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["sale_order", "product", "batch"]

# InventoryTransaction ViewSet
class InventoryTransactionViewSet(viewsets.ModelViewSet):
    """CRUD for inventory transactions (inbound, outbound, adjustments)."""
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["batch", "transaction_type", "user"]

# Payment ViewSet
class PaymentViewSet(viewsets.ModelViewSet):
    """CRUD for payments (payable/receivable)."""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["payment_type", "status", "payment_date"]

# AuditLog ViewSet (read-only)
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only view for audit logs."""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["user", "model_name", "action"]

# --- Smart Reports ---
from rest_framework.views import APIView

class StockSummaryReportView(APIView):
    """Returns current stock summary per product and batch."""
    def get(self, request):
        from django.db.models import Sum
        summary = (
            Batch.objects.values('product__id', 'product__name', 'batch_number', 'expiry_date')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('product__name', 'batch_number')
        )
        return Response(list(summary))

class ExpiredStockReportView(APIView):
    """Returns expired or expiring soon stock."""
    def get(self, request):
        from django.utils import timezone
        today = timezone.now().date()
        soon = today.replace(day=min(today.day+30,28))
        expired = Batch.objects.filter(expiry_date__lt=today)
        expiring_soon = Batch.objects.filter(expiry_date__gte=today, expiry_date__lte=soon)
        return Response({
            'expired': BatchSerializer(expired, many=True).data,
            'expiring_soon': BatchSerializer(expiring_soon, many=True).data
        })

class LowStockReportView(APIView):
    """Returns products with low stock (threshold=10)."""
    def get(self, request):
        from django.db.models import Sum
        threshold = int(request.query_params.get('threshold', 10))
        summary = (
            Batch.objects.values('product__id', 'product__name')
            .annotate(total_quantity=Sum('quantity'))
            .filter(total_quantity__lte=threshold)
        )
        return Response(list(summary))

class OutstandingPaymentsReportView(APIView):
    """Returns outstanding payables and receivables."""
    def get(self, request):
        payables = Payment.objects.filter(payment_type='payable', status='pending')
        receivables = Payment.objects.filter(payment_type='receivable', status='pending')
        return Response({
            'payables': PaymentSerializer(payables, many=True).data,
            'receivables': PaymentSerializer(receivables, many=True).data
        })

class InventoryMovementReportView(APIView):
    """Returns inventory movement history for a product or batch."""
    def get(self, request):
        product_id = request.query_params.get('product_id')
        batch_id = request.query_params.get('batch_id')
        qs = InventoryTransaction.objects.all()
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        elif product_id:
            qs = qs.filter(batch__product_id=product_id)
        return Response(InventoryTransactionSerializer(qs, many=True).data)
