import React from "react";

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

interface PurchaseOrderStep1Props {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
  manufacturers: any[];
  error?: string | null;
}

const PurchaseOrderStep1: React.FC<PurchaseOrderStep1Props> = ({ value, onChange, disabled, manufacturers, error }) => {
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value: v } = e.target;
    onChange({ ...value, [name]: v });
  }
  return (
    <div className="space-y-6">
      {error && <div className="text-red-500 text-center py-2">{error}</div>}
      <div>
        <label className="block font-medium text-slate-800 mb-1">Manufacturer <span className="text-red-500">*</span></label>
        <div className="relative">
          <select
            name="manufacturer_id"
            value={value.manufacturer_id}
            onChange={handleChange}
            className="w-full border border-blue-200/50 rounded px-3 py-2 bg-white text-slate-800 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            disabled={disabled}
          >
            <option value="">Select manufacturer</option>
            {manufacturers.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-slate-800 mb-1">Order Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="order_date"
            value={value.order_date}
            onChange={handleChange}
            className="w-full border border-blue-200/50 rounded px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium text-slate-800 mb-1">Payment Due Date</label>
          <input
            type="date"
            name="payment_due_date"
            value={value.payment_due_date}
            onChange={handleChange}
            className="w-full border border-blue-200/50 rounded px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-slate-800 mb-1">Status <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              name="status"
              value={value.status}
              onChange={handleChange}
              className="w-full border border-blue-200/50 rounded px-3 py-2 bg-white text-slate-800 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={disabled}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex-1">
          <label className="block font-medium text-slate-800 mb-1">Payment Status <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              name="payment_status"
              value={value.payment_status}
              onChange={handleChange}
              className="w-full border border-blue-200/50 rounded px-3 py-2 bg-white text-slate-800 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={disabled}
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div>
        <label className="block font-medium text-slate-800 mb-1">Remarks</label>
        <textarea
          name="remarks"
          value={value.remarks}
          onChange={handleChange}
          className="w-full border border-blue-200/50 rounded px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderStep1; 