import React from "react";

interface PurchaseOrderStep3Props {
  form: any;
  manufacturers: any[];
  products: any[];
  loading: boolean;
  onSubmit: () => void;
}

const PurchaseOrderStep3: React.FC<PurchaseOrderStep3Props> = ({ form, manufacturers, products, loading, onSubmit }) => {
  const manufacturer = manufacturers.find((m: any) => m.id == form.manufacturer_id);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Review & Submit</h3>
      <div className="mb-4">
        <div className="font-medium text-slate-800 mb-1">Manufacturer:</div>
        <div className="mb-2 text-slate-800">{manufacturer ? manufacturer.name : form.manufacturer_id}</div>
        <div className="font-medium text-slate-800 mb-1">Order Date:</div>
        <div className="mb-2 text-slate-800">{form.order_date}</div>
        <div className="font-medium text-slate-800 mb-1">Payment Due Date:</div>
        <div className="mb-2 text-slate-800">{form.payment_due_date}</div>
        <div className="font-medium text-slate-800 mb-1">Status:</div>
        <div className="mb-2 text-slate-800">{form.status}</div>
        <div className="font-medium text-slate-800 mb-1">Payment Status:</div>
        <div className="mb-2 text-slate-800">{form.payment_status}</div>
        <div className="font-medium text-slate-800 mb-1">Remarks:</div>
        <div className="mb-2 text-slate-800">{form.remarks || <span className="text-slate-400">--</span>}</div>
      </div>
      <div>
        <div className="font-medium text-slate-800 mb-2">Items:</div>
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
              </tr>
            </thead>
            <tbody>
              {(form.items || []).map((item: any, idx: number) => {
                const product = products.find((p: any) => p.id === item.product_id);
                return (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-800">{product ? product.name : item.product_id}</td>
                    <td className="px-3 py-2 text-slate-800">{item.quantity}</td>
                    <td className="px-3 py-2 text-slate-800">₹{item.unit_price}</td>
                    <td className="px-3 py-2 text-slate-800">{item.batch_number || "--"}</td>
                    <td className="px-3 py-2 text-slate-800">{item.manufacture_date || "--"}</td>
                    <td className="px-3 py-2 text-slate-800">{item.expiry_date || "--"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
          Submit
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrderStep3; 