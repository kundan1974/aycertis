import MainLayout from "../components/MainLayout"
import { useState } from "react"
import { PurchaseOrdersTab } from "./purchase-orders"

function SalesOrdersTab() {
  // Placeholder for now
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-12 flex flex-col items-center justify-center min-h-[300px]">
      <span className="text-5xl mb-4">🛒</span>
      <h2 className="text-2xl font-bold text-slate-700 mb-2">Sales Orders</h2>
      <p className="text-slate-500 text-center max-w-md">Sales order management features will be available soon. You will be able to view, create, and manage sales orders from this page.</p>
    </div>
  )
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState("purchase")

  return (
    <MainLayout active="orders">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
              Orders
            </h1>
            <p className="text-slate-600 mt-2">Manage purchase and sales orders in one place.</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            className={`px-6 py-3 rounded-t-xl font-semibold text-base transition-all duration-200 border-b-2 ${
              activeTab === "purchase"
                ? "bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 border-blue-500 shadow"
                : "bg-white/70 text-slate-600 border-transparent hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab("purchase")}
          >
            Purchase Orders
          </button>
          <button
            className={`px-6 py-3 rounded-t-xl font-semibold text-base transition-all duration-200 border-b-2 ${
              activeTab === "sales"
                ? "bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 border-blue-500 shadow"
                : "bg-white/70 text-slate-600 border-transparent hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab("sales")}
          >
            Sales Orders
          </button>
        </div>
        {/* Tab Content */}
        <div>
          {activeTab === "purchase" ? <PurchaseOrdersTab /> : <SalesOrdersTab />}
        </div>
      </div>
    </MainLayout>
  )
} 