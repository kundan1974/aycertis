import React from "react";

interface PurchaseOrderViewModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
  loading?: boolean;
  error?: string;
}

const field = (label: string, value: React.ReactNode) => (
  <div className="mb-2">
    <div className="text-xs text-slate-500 font-medium">{label}</div>
    <div className="text-base text-slate-800 font-semibold">{value || <span className="text-slate-400">--</span>}</div>
  </div>
);

const PurchaseOrderViewModal: React.FC<PurchaseOrderViewModalProps> = ({ open, onClose, order, loading, error }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-3xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl transition-colors duration-200"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 rounded-lg px-3 py-1 text-lg font-mono">PO#{order?.id}</span>
          View Purchase Order
        </h2>
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 font-medium">{error}</div>
        ) : !order ? (
          <div className="py-16 text-center text-slate-400">No data</div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                {field("Order Date", order.order_date)}
                {field("Payment Due Date", order.payment_due_date)}
                {field("Status", order.status)}
                {field("Payment Status", order.payment_status)}
                {field("Remarks", order.remarks)}
                {field("Created At", order.created_at && new Date(order.created_at).toLocaleString())}
                {field("Updated At", order.updated_at && new Date(order.updated_at).toLocaleString())}
              </div>
              <div>
                <div className="mb-2 text-xs text-slate-500 font-medium">Manufacturer</div>
                <div className="bg-slate-50 rounded-lg p-3 mb-2">
                  <div className="font-semibold text-blue-700 text-lg">{order.manufacturer_name || order.manufacturer?.name || "--"}</div>
                  <div className="text-slate-600 text-sm">{order.manufacturer?.contact_person}</div>
                  <div className="text-slate-600 text-sm">{order.manufacturer?.phone}</div>
                  <div className="text-slate-600 text-sm">{order.manufacturer?.email}</div>
                  <div className="text-slate-600 text-sm">{order.manufacturer?.address}</div>
                  <div className="text-slate-600 text-sm">GSTIN: {order.manufacturer?.gstin}</div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="font-medium text-slate-700 mb-2">Items</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm bg-white">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Product</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Qty</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Unit Price</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Batch #</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Mfg Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Exp Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-800">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="px-3 py-2">{item.product?.name || item.product_id}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">₹{item.unit_price}</td>
                        <td className="px-3 py-2">{item.batch_number || "--"}</td>
                        <td className="px-3 py-2">{item.manufacture_date || "--"}</td>
                        <td className="px-3 py-2">{item.expiry_date || "--"}</td>
                        <td className="px-3 py-2">₹{(parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end items-center gap-8 mt-6">
              <div className="text-lg font-bold text-slate-700">Total: <span className="text-blue-700">₹{order.total_amount}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderViewModal; 