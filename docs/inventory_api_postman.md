# Aycertis Inventory Management API Documentation

This document describes the RESTful API endpoints for the Inventory Management module of the Aycertis Pharmaceutical SaaS platform.

---

## **Authentication**
All endpoints require JWT authentication. Include the following header in your requests:

```
Authorization: Bearer <access_token>
```

---

## **Base URL**
```
/api/inventory/
```

---

## **Endpoints Overview**

### **Products**
- `GET /products/` — List all products
- `POST /products/` — Create a new product
- `GET /products/{id}/` — Retrieve a product
- `PUT /products/{id}/` — Update a product
- `DELETE /products/{id}/` — Delete a product

### **Manufacturers**
- `GET /manufacturers/` — List all manufacturers
- `POST /manufacturers/` — Create a new manufacturer
- `GET /manufacturers/{id}/` — Retrieve a manufacturer
- `PUT /manufacturers/{id}/` — Update a manufacturer
- `DELETE /manufacturers/{id}/` — Delete a manufacturer

### **Customers**
- `GET /customers/` — List all customers
- `POST /customers/` — Create a new customer
- `GET /customers/{id}/` — Retrieve a customer
- `PUT /customers/{id}/` — Update a customer
- `DELETE /customers/{id}/` — Delete a customer

### **Purchase Orders**
- `GET /purchase-orders/` — List all purchase orders
- `POST /purchase-orders/` — Create a purchase order (with items)
- `GET /purchase-orders/{id}/` — Retrieve a purchase order
- `PUT /purchase-orders/{id}/` — Update a purchase order
- `DELETE /purchase-orders/{id}/` — Delete a purchase order

#### **Sample Create Purchase Order Request**
```json
{
  "manufacturer_id": 1,
  "order_date": "2024-07-01",
  "total_amount": "10000.00",
  "status": "pending",
  "payment_due_date": "2024-07-15",
  "payment_status": "pending",
  "remarks": "Urgent order",
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "unit_price": "100.00",
      "batch_number": "BATCH001",
      "manufacture_date": "2024-06-01",
      "expiry_date": "2026-06-01"
    }
  ]
}
```

### **Purchase Order Items**
- `GET /purchase-order-items/` — List all purchase order items
- `POST /purchase-order-items/` — Create a purchase order item

### **Batches**
- `GET /batches/` — List all batches
- `POST /batches/` — Create a batch
- `GET /batches/{id}/` — Retrieve a batch
- `PUT /batches/{id}/` — Update a batch
- `DELETE /batches/{id}/` — Delete a batch

### **Sale Orders**
- `GET /sale-orders/` — List all sale orders
- `POST /sale-orders/` — Create a sale order (with items)
- `GET /sale-orders/{id}/` — Retrieve a sale order
- `PUT /sale-orders/{id}/` — Update a sale order
- `DELETE /sale-orders/{id}/` — Delete a sale order

#### **Sample Create Sale Order Request**
```json
{
  "customer_id": 1,
  "order_date": "2024-07-02",
  "total_amount": "5000.00",
  "status": "pending",
  "payment_due_date": "2024-07-20",
  "payment_status": "pending",
  "remarks": "First order",
  "items": [
    {
      "product_id": 1,
      "batch_id": 1,
      "quantity": 50,
      "unit_price": "100.00"
    }
  ]
}
```

### **Sale Order Items**
- `GET /sale-order-items/` — List all sale order items
- `POST /sale-order-items/` — Create a sale order item

### **Inventory Transactions**
- `GET /inventory-transactions/` — List all inventory transactions
- `POST /inventory-transactions/` — Create a transaction

### **Payments**
- `GET /payments/` — List all payments
- `POST /payments/` — Create a payment

### **Audit Logs**
- `GET /audit-logs/` — List all audit logs (read-only)

---

## **Smart Reports**

### **Stock Summary**
- `GET /reports/stock-summary/` — Current stock per product and batch

### **Expired/Expiring Stock**
- `GET /reports/expired-stock/` — Expired and expiring soon stock

### **Low Stock**
- `GET /reports/low-stock/?threshold=10` — Products with stock below threshold

### **Outstanding Payments**
- `GET /reports/outstanding-payments/` — Pending payables and receivables

### **Inventory Movement**
- `GET /reports/inventory-movement/?product_id=1` — Movement for a product
- `GET /reports/inventory-movement/?batch_id=1` — Movement for a batch

---

## **General Notes**
- All endpoints support standard CRUD operations unless otherwise noted.
- Use filtering and search parameters as supported (see endpoint details).
- All dates are in `YYYY-MM-DD` format.
- All monetary values are strings for precision.

---

For further details, refer to the DRF browsable API or contact the backend team. 