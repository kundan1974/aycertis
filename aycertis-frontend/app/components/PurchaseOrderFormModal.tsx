import { useState, useEffect, useRef } from "react"
import PurchaseOrderStep1 from "./PurchaseOrderStep1"
import PurchaseOrderStep2 from "./PurchaseOrderStep2"
import PurchaseOrderStep3 from "./PurchaseOrderStep3"

interface PurchaseOrderFormModalProps {
  open: boolean
  onClose: () => void
  initialData?: any
  onSubmit: (data: any) => void
  loading?: boolean
  error?: string
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];
const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export default function PurchaseOrderFormModal({ open, onClose, initialData, onSubmit, loading, error }: PurchaseOrderFormModalProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialData || {
    manufacturer_id: "",
    order_date: "",
    payment_due_date: "",
    status: "pending",
    payment_status: "pending",
    remarks: "",
    items: [],
  })
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState("")
  const [itemDraft, setItemDraft] = useState<any>({ product_id: "", quantity: "", unit_price: "", batch_number: "", manufacture_date: "", expiry_date: "" })
  const [itemEditIndex, setItemEditIndex] = useState<number | null>(null)
  const [itemError, setItemError] = useState("")
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const originalItemsRef = useRef<any[]>([]);

  useEffect(() => {
    if (open && initialData) {
      setForm({
        manufacturer_id: initialData.manufacturer_id || (initialData.manufacturer && initialData.manufacturer.id) || "",
        order_date: initialData.order_date || "",
        payment_due_date: initialData.payment_due_date || "",
        status: initialData.status || "pending",
        payment_status: initialData.payment_status || "pending",
        remarks: initialData.remarks || "",
        items: (initialData.items || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id || (item.product && item.product.id) || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          batch_number: item.batch_number,
          manufacture_date: item.manufacture_date,
          expiry_date: item.expiry_date,
        })),
      });
      originalItemsRef.current = (initialData.items || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id || (item.product && item.product.id) || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        batch_number: item.batch_number,
        manufacture_date: item.manufacture_date,
        expiry_date: item.expiry_date,
      }));
      setStep(1);
    } else if (open && !initialData) {
      setForm({
        manufacturer_id: "",
        order_date: "",
        payment_due_date: "",
        status: "pending",
        payment_status: "pending",
        remarks: "",
        items: [],
      });
      originalItemsRef.current = [];
      setStep(1);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;
    setProductsLoading(true);
    setProductsError("");
    fetch("/api/inventory/products/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        let fetchedProducts = Array.isArray(data) ? data : data.results || [];
        // If editing, ensure all products referenced by items are present
        if (initialData && initialData.items) {
          const missingProductIds = initialData.items
            .map((item: any) => item.product_id || (item.product && item.product.id))
            .filter((id: any) => id && !fetchedProducts.some((p: any) => p.id === id));
          if (missingProductIds.length > 0) {
            Promise.all(
              missingProductIds.map((id: any) =>
                fetch(`/api/inventory/products/${id}/`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
                }).then((res) => res.ok ? res.json() : null)
              )
            ).then((missingProducts) => {
              setProducts([
                ...fetchedProducts,
                ...missingProducts.filter(Boolean),
              ]);
              setProductsLoading(false);
            });
            return;
          }
        }
        setProducts(fetchedProducts);
        setProductsLoading(false);
      })
      .catch(() => {
        setProductsError("Could not load products");
        setProductsLoading(false);
      });
    fetch("/api/inventory/manufacturers/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch manufacturers");
        return res.json();
      })
      .then((data) => {
        setManufacturers(data.results || data);
      })
      .catch(() => {
        // Optionally handle error
      });
  }, [open, initialData]);

  function handleItemDraftChange(e: any) {
    const { name, value } = e.target
    setItemDraft((d: any) => ({ ...d, [name]: value }))
  }
  function handleAddItem() {
    if (!itemDraft.product_id || !itemDraft.quantity || !itemDraft.unit_price) {
      setItemError("Product, quantity, and unit price are required.")
      return
    }
    setItemError("")
    if (itemEditIndex !== null) {
      setForm((f: any) => ({ ...f, items: f.items.map((it: any, i: number) => (i === itemEditIndex ? itemDraft : it)) }))
      setItemEditIndex(null)
    } else {
      setForm((f: any) => ({ ...f, items: [...(f.items || []), itemDraft] }))
    }
    setItemDraft({ product_id: "", quantity: "", unit_price: "", batch_number: "", manufacture_date: "", expiry_date: "" })
  }
  function handleEditItem(idx: number) {
    setItemDraft(form.items[idx])
    setItemEditIndex(idx)
  }
  function handleDeleteItem(idx: number) {
    setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) }))
    if (itemEditIndex === idx) {
      setItemDraft({ product_id: "", quantity: "", unit_price: "", batch_number: "", manufacture_date: "", expiry_date: "" })
      setItemEditIndex(null)
    }
  }
  function handleNextStep2() {
    if (!form.items || form.items.length === 0) {
      setItemError("Please add at least one item.")
      return
    }
    setItemError("")
    setStep(3)
  }

  function validateStep1(form: any) {
    if (!form.manufacturer_id) return "Manufacturer is required.";
    if (!form.order_date) return "Order date is required.";
    if (!form.status) return "Status is required.";
    if (!form.payment_status) return "Payment status is required.";
    return null;
  }

  function handleNextStep1() {
    const err = validateStep1(form);
    if (err) {
      setStep1Error(err);
      return;
    }
    setStep1Error(null);
    setStep(2);
  }

  function calculateTotalAmount(items: any[]) {
    return items.reduce(
      (sum, item) => sum + (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0)),
      0
    );
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl transition-colors duration-200"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {initialData ? "Edit Purchase Order" : "Add Purchase Order"}
        </h2>
        {error && <div className="mb-4 text-red-600 font-medium text-center">{error}</div>}
        <div className="mb-6 flex gap-4">
          <div className={`flex-1 text-center py-2 rounded-xl ${step === 1 ? "bg-blue-100 text-blue-700 font-semibold" : "bg-slate-100 text-slate-500"}`}>1. Basic Info</div>
          <div className={`flex-1 text-center py-2 rounded-xl ${step === 2 ? "bg-blue-100 text-blue-700 font-semibold" : "bg-slate-100 text-slate-500"}`}>2. Items</div>
          <div className={`flex-1 text-center py-2 rounded-xl ${step === 3 ? "bg-blue-100 text-blue-700 font-semibold" : "bg-slate-100 text-slate-500"}`}>3. Review</div>
        </div>
        <div className="min-h-[200px]">
          {step === 1 && (
            <PurchaseOrderStep1
              value={form}
              onChange={(v) => setForm((f: any) => ({ ...f, ...v }))}
              disabled={loading}
              manufacturers={manufacturers}
              error={step1Error}
            />
          )}
          {step === 2 && (
            <PurchaseOrderStep2
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
              items={form.items}
              itemDraft={itemDraft}
              itemEditIndex={itemEditIndex}
              itemError={itemError}
              onItemDraftChange={handleItemDraftChange}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onCancelEdit={() => {
                setItemDraft({ product_id: "", quantity: "", unit_price: "", batch_number: "", manufacture_date: "", expiry_date: "" });
                setItemEditIndex(null);
              }}
            />
          )}
          {step === 3 && (
            <PurchaseOrderStep3
              form={form}
              manufacturers={manufacturers}
              products={products}
              loading={!!loading}
              onSubmit={async () => {
                const total_amount = calculateTotalAmount(form.items);
                if (initialData && initialData.id) {
                  const originalItems = originalItemsRef.current;
                  const currentItems = form.items;
                  const deletedItems = originalItems.filter((oi: any) => oi.id && !currentItems.some((ci: any) => ci.id === oi.id));
                  const newItems = currentItems.filter((ci: any) => !ci.id);
                  const updatedItems = currentItems.filter((ci: any) => {
                    if (!ci.id) return false;
                    const orig = originalItems.find((oi: any) => oi.id === ci.id);
                    if (!orig) return false;
                    return (
                      ci.product_id !== orig.product_id ||
                      String(ci.quantity) !== String(orig.quantity) ||
                      String(ci.unit_price) !== String(orig.unit_price) ||
                      String(ci.batch_number) !== String(orig.batch_number) ||
                      String(ci.manufacture_date) !== String(orig.manufacture_date) ||
                      String(ci.expiry_date) !== String(orig.expiry_date)
                    );
                  });
                  try {
                    await Promise.all(
                      deletedItems.map((item: any) =>
                        fetch(`/api/inventory/purchase-order-items/${item.id}/`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
                        })
                      )
                    );
                    await Promise.all(
                      updatedItems.map((item: any) =>
                        fetch(`/api/inventory/purchase-order-items/${item.id}/`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                          },
                          body: JSON.stringify({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            batch_number: item.batch_number,
                            manufacture_date: item.manufacture_date,
                            expiry_date: item.expiry_date,
                            purchase_order_id: initialData.id,
                          }),
                        })
                      )
                    );
                    await Promise.all(
                      newItems.map((item: any) =>
                        fetch(`/api/inventory/purchase-order-items/`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                          },
                          body: JSON.stringify({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            batch_number: item.batch_number,
                            manufacture_date: item.manufacture_date,
                            expiry_date: item.expiry_date,
                            purchase_order_id: initialData.id,
                          }),
                        })
                      )
                    );
                    const payload = {
                      manufacturer_id: form.manufacturer_id,
                      order_date: form.order_date,
                      payment_due_date: form.payment_due_date,
                      status: form.status,
                      payment_status: form.payment_status,
                      remarks: form.remarks,
                      total_amount,
                    };
                    const res = await fetch(`/api/inventory/purchase-orders/${initialData.id}/`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                      },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error("Failed to update purchase order");
                    onSubmit(payload);
                  } catch (err: any) {
                    alert("Failed to update purchase order: " + (err.message || err));
                  }
                } else {
                  const itemsPayload = form.items.map((item: any) => {
                    if (item.id !== undefined && item.id !== null) {
                      return { ...item, id: item.id };
                    }
                    const { id, ...rest } = item;
                    return rest;
                  });
                  const payload = { ...form, items: itemsPayload, total_amount };
                  console.log("[PurchaseOrderFormModal] Submitting payload:", payload);
                  onSubmit(payload);
                }
              }}
            />
          )}
        </div>
        <div className="flex justify-between mt-8">
          <button
            className="px-4 py-2 rounded bg-slate-100 text-slate-600 font-medium hover:bg-slate-200"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
          >
            Back
          </button>
          {step !== 3 && (
            <button
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
              onClick={step === 1 ? handleNextStep1 : handleNextStep2}
              disabled={loading}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 