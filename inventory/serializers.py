from rest_framework import serializers
from .models import (
    Product, Manufacturer, Customer, PurchaseOrder, PurchaseOrderItem, Batch,
    SaleOrder, SaleOrderItem, InventoryTransaction, Payment, AuditLog
)

class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)
    purchase_order_id = serializers.PrimaryKeyRelatedField(queryset=PurchaseOrder.objects.all(), source='purchase_order', write_only=True, required=False)
    
    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id', 'product', 'product_id', 'purchase_order_id', 'quantity', 'unit_price',
            'batch_number', 'manufacture_date', 'expiry_date', 'created_at', 'updated_at'
        ]

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    manufacturer = ManufacturerSerializer(read_only=True)
    manufacturer_id = serializers.PrimaryKeyRelatedField(queryset=Manufacturer.objects.all(), source='manufacturer', write_only=True)
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'manufacturer', 'manufacturer_id', 'manufacturer_name', 'order_date', 'total_amount', 'status', 'payment_due_date', 'payment_status', 'remarks', 'created_by', 'created_at', 'updated_at', 'items']

class BatchSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model = Batch
        fields = ['id', 'product', 'product_id', 'batch_number', 'manufacture_date', 'expiry_date', 'quantity', 'purchase_order_item', 'status', 'created_at', 'updated_at']

class SaleOrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), source='batch', write_only=True)
    sale_order_id = serializers.PrimaryKeyRelatedField(queryset=SaleOrder.objects.all(), source='sale_order', write_only=True, required=False)

    class Meta:
        model = SaleOrderItem
        fields = ['id', 'product', 'product_id', 'batch', 'batch_id', 'sale_order_id', 'quantity', 'unit_price', 'created_at', 'updated_at']

class SaleOrderSerializer(serializers.ModelSerializer):
    items = SaleOrderItemSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), source='customer', write_only=True)

    class Meta:
        model = SaleOrder
        fields = ['id', 'customer', 'customer_id', 'order_date', 'total_amount', 'status', 'payment_due_date', 'payment_status', 'remarks', 'created_by', 'created_at', 'updated_at', 'items']

class InventoryTransactionSerializer(serializers.ModelSerializer):
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), source='batch', write_only=True)

    class Meta:
        model = InventoryTransaction
        fields = ['id', 'batch', 'batch_id', 'transaction_type', 'quantity', 'date', 'reference_type', 'reference_id', 'user', 'remarks']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__' 