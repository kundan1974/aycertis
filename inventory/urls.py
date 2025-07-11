from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, ManufacturerViewSet, CustomerViewSet,
    PurchaseOrderViewSet, PurchaseOrderItemViewSet, BatchViewSet,
    SaleOrderViewSet, SaleOrderItemViewSet, InventoryTransactionViewSet,
    PaymentViewSet, AuditLogViewSet,
    StockSummaryReportView, ExpiredStockReportView, LowStockReportView,
    OutstandingPaymentsReportView, InventoryMovementReportView
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'purchase-order-items', PurchaseOrderItemViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'sale-orders', SaleOrderViewSet)
router.register(r'sale-order-items', SaleOrderItemViewSet)
router.register(r'inventory-transactions', InventoryTransactionViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
    # Smart report endpoints
    path('reports/stock-summary/', StockSummaryReportView.as_view(), name='stock-summary-report'),
    path('reports/expired-stock/', ExpiredStockReportView.as_view(), name='expired-stock-report'),
    path('reports/low-stock/', LowStockReportView.as_view(), name='low-stock-report'),
    path('reports/outstanding-payments/', OutstandingPaymentsReportView.as_view(), name='outstanding-payments-report'),
    path('reports/inventory-movement/', InventoryMovementReportView.as_view(), name='inventory-movement-report'),
] 