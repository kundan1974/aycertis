from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class Manufacturer(models.Model):
    """Represents a pharma product manufacturer."""
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    gstin = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    """Represents a hospital or distributor customer."""
    CUSTOMER_TYPE_CHOICES = [
        ("hospital", "Hospital"),
        ("distributor", "Distributor"),
        ("retail", "Retail"),
        ("clinic", "Clinic"),
        ("other", "Other"),
    ]
    name = models.CharField(max_length=255)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES)
    contact_person = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    gstin = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    """Represents a pharmaceutical product."""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    hsn_code = models.CharField(max_length=20, blank=True)
    unit = models.CharField(max_length=20, default="pcs")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    """Order placed to a manufacturer."""
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("received", "Received"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.PROTECT, related_name="purchase_orders")
    order_date = models.DateField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_due_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, default="pending")
    remarks = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PO-{self.id} to {self.manufacturer.name}"

class PurchaseOrderItem(models.Model):
    """Line item for a purchase order."""
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    batch_number = models.CharField(max_length=100)
    manufacture_date = models.DateField()
    expiry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (PO-{self.purchase_order.id})"

class Batch(models.Model):
    """Tracks a batch/lot of a product."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="batches")
    batch_number = models.CharField(max_length=100)
    manufacture_date = models.DateField()
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    purchase_order_item = models.ForeignKey(PurchaseOrderItem, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[("active", "Active"), ("expired", "Expired")], default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.batch_number}"

class SaleOrder(models.Model):
    """Order placed by a customer (hospital/distributor)."""
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("dispatched", "Dispatched"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="sale_orders")
    order_date = models.DateField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_due_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, default="pending")
    remarks = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SO-{self.id} to {self.customer.name}"

class SaleOrderItem(models.Model):
    """Line item for a sale order."""
    sale_order = models.ForeignKey(SaleOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (SO-{self.sale_order.id})"

class InventoryTransaction(models.Model):
    """Tracks all inventory movements (inbound, outbound, adjustments)."""
    TRANSACTION_TYPE_CHOICES = [
        ("IN", "Inbound"),
        ("OUT", "Outbound"),
        ("ADJUST", "Adjustment"),
    ]
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT, related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    quantity = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
    reference_type = models.CharField(max_length=50, blank=True)  # e.g., 'PurchaseOrder', 'SaleOrder', etc.
    reference_id = models.PositiveIntegerField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.transaction_type} {self.quantity} of {self.batch}"

class Payment(models.Model):
    """Tracks payments for purchase and sale orders."""
    PAYMENT_TYPE_CHOICES = [
        ("payable", "Payable"),
        ("receivable", "Receivable"),
    ]
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default="pending")
    # Generic relation to either PurchaseOrder or SaleOrder
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    related_object = GenericForeignKey('content_type', 'object_id')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.payment_type} {self.amount} ({self.status})"

class AuditLog(models.Model):
    """Tracks all changes for audit and compliance."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)  # e.g., 'create', 'update', 'delete'
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    before_state = models.JSONField(null=True, blank=True)
    after_state = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.action} on {self.model_name} by {self.user}"
