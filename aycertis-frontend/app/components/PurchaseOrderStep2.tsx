import React from "react";

interface PurchaseOrderStep2Props {
  products: any[];
  productsLoading?: boolean;
  productsError: string;
  items: any[];
  itemDraft: any;
  itemEditIndex: number | null;
  itemError: string;
  onItemDraftChange: (e: React.ChangeEvent<any>) => void;
  onAddItem: () => void;
  onEditItem: (idx: number) => void;
  onDeleteItem: (idx: number) => void;
  onCancelEdit: () => void;
}

const PurchaseOrderStep2: React.FC<PurchaseOrderStep2Props> = ({
  products,
  productsLoading = false,
  productsError,
  items,
  itemDraft,
  itemEditIndex,
  itemError,
  onItemDraftChange,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onCancelEdit,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Add Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Product <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              name="product_id"
              value={itemDraft.product_id}
              onChange={onItemDraftChange}
              className="w-full px-3 py-2 border border-blue-200/50 rounded-lg bg-white text-slate-800 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select product</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Quantity <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="quantity"
            value={itemDraft.quantity}
            onChange={onItemDraftChange}
            className="w-full px-3 py-2 border border-blue-200/50 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Unit Price <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="unit_price"
            value={itemDraft.unit_price}
            onChange={onItemDraftChange}
            className="w-full px-3 py-2 border border-blue-200/50 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Batch Number</label>
          <input
            type="text"
            name="batch_number"
            value={itemDraft.batch_number}
            onChange={onItemDraftChange}
            className="w-full px-3 py-2 border border-blue-200/50 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Manufacture Date</label>
          <input
            type="date"
            name="manufacture_date"
            value={itemDraft.manufacture_date}
            onChange={onItemDraftChange}
            className="w-full px-3 py-2 border border-blue-200/50 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Expiry Date</label>
          <input
            type="date"
            name="expiry_date"
            value={itemDraft.expiry_date}
            onChange={onItemDraftChange}
            className="w-full px-3 py-2 border border-blue-200/50 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
          type="button"
          onClick={onAddItem}
          disabled={productsLoading}
        >
          {itemEditIndex !== null ? "Update Item" : "Add Item"}
        </button>
        {itemEditIndex !== null && (
          <button
            className="px-4 py-2 rounded bg-slate-100 text-slate-600 font-medium hover:bg-slate-200"
            type="button"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
      {itemError && <div className="mb-2 text-red-600 font-medium">{itemError}</div>}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm bg-white">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Product</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Qty</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Unit Price</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Batch #</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Mfg Date</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Exp Date</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-slate-400">No items added</td>
              </tr>
            ) : (
              items.map((item: any, idx: number) => {
                const product = products.find((p: any) => p.id === item.product_id);
                return (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-800">{product ? product.name : item.product_id}</td>
                    <td className="px-3 py-2 text-slate-800">{item.quantity}</td>
                    <td className="px-3 py-2 text-slate-800">₹{item.unit_price}</td>
                    <td className="px-3 py-2 text-slate-800">{item.batch_number || "--"}</td>
                    <td className="px-3 py-2 text-slate-800">{item.manufacture_date || "--"}</td>
                    <td className="px-3 py-2 text-slate-800">{item.expiry_date || "--"}</td>
                    <td className="px-3 py-2 flex gap-1">
                      <button className="text-blue-600 hover:underline" type="button" onClick={() => onEditItem(idx)}>Edit</button>
                      <button className="text-red-600 hover:underline" type="button" onClick={() => onDeleteItem(idx)}>Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderStep2; 