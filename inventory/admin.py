from django.contrib import admin
from .models import (
    Product, Manufacturer, Customer, PurchaseOrder, PurchaseOrderItem, Batch,
    SaleOrder, SaleOrderItem, InventoryTransaction, Payment, AuditLog
)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "hsn_code", "unit", "is_active", "created_at")
    search_fields = ("name", "category", "hsn_code")

@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ("name", "gstin", "contact_person", "phone", "email")
    search_fields = ("name", "gstin")

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "customer_type", "gstin", "contact_person", "phone", "email")
    search_fields = ("name", "gstin")

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "manufacturer", "order_date", "total_amount", "status", "payment_status")
    search_fields = ("id", "manufacturer__name")
    inlines = [PurchaseOrderItemInline]

@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = ("purchase_order", "product", "batch_number", "quantity", "unit_price", "expiry_date")
    search_fields = ("purchase_order__id", "product__name", "batch_number")

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ("product", "batch_number", "manufacture_date", "expiry_date", "quantity", "status")
    search_fields = ("product__name", "batch_number")

class SaleOrderItemInline(admin.TabularInline):
    model = SaleOrderItem
    extra = 0

@admin.register(SaleOrder)
class SaleOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "order_date", "total_amount", "status", "payment_status")
    search_fields = ("id", "customer__name")
    inlines = [SaleOrderItemInline]

@admin.register(SaleOrderItem)
class SaleOrderItemAdmin(admin.ModelAdmin):
    list_display = ("sale_order", "product", "batch", "quantity", "unit_price")
    search_fields = ("sale_order__id", "product__name", "batch__batch_number")

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ("batch", "transaction_type", "quantity", "date", "user", "remarks")
    search_fields = ("batch__batch_number", "transaction_type")

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("payment_type", "amount", "payment_date", "status", "content_type", "object_id")
    search_fields = ("payment_type", "status")

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "model_name", "object_id", "timestamp")
    search_fields = ("user__username", "model_name", "action")
