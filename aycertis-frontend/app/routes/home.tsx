"use client"

import type { Route } from "./+types/home"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import logo from "../media/logo_black.png"
import Sidebar from "../components/Sidebar"
import MainLayout from "../components/MainLayout"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard | Aycertis" }, { name: "description", content: "Aycertis Inventory Dashboard" }]
}

function getInitials(name?: string) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>({})
  const [profileOpen, setProfileOpen] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState("")

  // Dashboard data states
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState("")
  const [totalProducts, setTotalProducts] = useState<number | null>(null)
  const [lowStock, setLowStock] = useState<number | null>(null)
  const [expiredStock, setExpiredStock] = useState<number | null>(null)
  const [outstandingPayments, setOutstandingPayments] = useState<string | null>(null)
  const [recentMovements, setRecentMovements] = useState<any[]>([])

  // Sales & Purchase Orders
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(true)
  const [salesOrdersError, setSalesOrdersError] = useState("")
  const [salesOrdersKPIs, setSalesOrdersKPIs] = useState<{ total: number; pending: number; totalValue: number }>({
    total: 0,
    pending: 0,
    totalValue: 0,
  })

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(true)
  const [purchaseOrdersError, setPurchaseOrdersError] = useState("")
  const [purchaseOrdersKPIs, setPurchaseOrdersKPIs] = useState<{ total: number; pending: number; totalValue: number }>({
    total: 0,
    pending: 0,
    totalValue: 0,
  })

  // Accordion states
  const [showInventory, setShowInventory] = useState(true)
  const [showSales, setShowSales] = useState(false)
  const [showPurchase, setShowPurchase] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }
    // Fetch user profile
    setLoadingProfile(true)
    setProfileError("")
    fetch("/api/auth/profile/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) {
          throw new Error("Failed to fetch profile")
        }
        return res.json()
      })
      .then((data) => {
        if (data) setUser(data)
        setLoadingProfile(false)
      })
      .catch((err) => {
        setProfileError("Could not load profile")
        setLoadingProfile(false)
      })
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    setDashboardLoading(true)
    setDashboardError("")
    // Fetch all dashboard data in parallel
    Promise.all([
      fetch("/api/inventory/products/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/reports/low-stock/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/reports/expired-stock/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/reports/outstanding-payments/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/inventory-transactions/?limit=5", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([productsRes, lowStockRes, expiredRes, paymentsRes, movementsRes]) => {
        if ([productsRes, lowStockRes, expiredRes, paymentsRes, movementsRes].some((r) => r.status === 401)) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return
        }
        if ([productsRes, lowStockRes, expiredRes, paymentsRes, movementsRes].some((r) => !r.ok)) {
          throw new Error("Failed to fetch dashboard data")
        }
        const products = await productsRes.json()
        const lowStock = await lowStockRes.json()
        const expired = await expiredRes.json()
        const payments = await paymentsRes.json()
        const movements = await movementsRes.json()
        setTotalProducts(Array.isArray(products) ? products.length : products.count || 0)
        setLowStock(Array.isArray(lowStock) ? lowStock.length : lowStock.count || 0)
        setExpiredStock(Array.isArray(expired) ? expired.length : expired.count || 0)
        setOutstandingPayments(payments && typeof payments === "object" && payments.total ? payments.total : "--")
        setRecentMovements(Array.isArray(movements) ? movements.slice(0, 5) : (movements.results || []).slice(0, 5))
        setDashboardLoading(false)
      })
      .catch((err) => {
        setDashboardError("Could not load dashboard data")
        setDashboardLoading(false)
      })
  }, [navigate])

  // Fetch Sales Orders
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    setSalesOrdersLoading(true)
    setSalesOrdersError("")
    fetch("/api/inventory/sale-orders/?limit=5", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) throw new Error("Failed to fetch sales orders")
        return res.json()
      })
      .then((data) => {
        if (!data) return
        const orders = Array.isArray(data) ? data : data.results || []
        setSalesOrders(orders)
        // KPIs
        setSalesOrdersKPIs({
          total: data.count || orders.length,
          pending: orders.filter((o: any) => o.status === "pending").length,
          totalValue: orders.reduce((sum: number, o: any) => sum + Number.parseFloat(o.total_amount || 0), 0),
        })
        setSalesOrdersLoading(false)
      })
      .catch(() => {
        setSalesOrdersError("Could not load sales orders")
        setSalesOrdersLoading(false)
      })
  }, [navigate])

  // Fetch Purchase Orders
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    setPurchaseOrdersLoading(true)
    setPurchaseOrdersError("")
    fetch("/api/inventory/purchase-orders/?limit=5", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) throw new Error("Failed to fetch purchase orders")
        return res.json()
      })
      .then((data) => {
        if (!data) return
        const orders = Array.isArray(data) ? data : data.results || []
        setPurchaseOrders(orders)
        // KPIs
        setPurchaseOrdersKPIs({
          total: data.count || orders.length,
          pending: orders.filter((o: any) => o.status === "pending").length,
          totalValue: orders.reduce((sum: number, o: any) => sum + Number.parseFloat(o.total_amount || 0), 0),
        })
        setPurchaseOrdersLoading(false)
      })
      .catch(() => {
        setPurchaseOrdersError("Could not load purchase orders")
        setPurchaseOrdersLoading(false)
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/login", { replace: true })
  }

  return (
    <MainLayout active="dashboard">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Welcome{user.first_name ? `, ${user.first_name}` : ""}! Here's your business overview.
          </p>
        </div>
      </div>
      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* Total Products Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Products</span>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-800">
            {dashboardLoading ? (
              <span className="animate-pulse text-slate-400">...</span>
            ) : totalProducts !== null ? (
              totalProducts.toLocaleString()
            ) : (
              "--"
            )}
          </span>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Low Stock</span>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300">
              <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
            </div>
          </div>
          <span className="text-3xl font-bold text-amber-600">
            {dashboardLoading ? (
              <span className="animate-pulse text-slate-400">...</span>
            ) : lowStock !== null ? (
              lowStock.toLocaleString()
            ) : (
              "--"
            )}
          </span>
        </div>

        {/* Expired/Expiring Stock Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Expiring/Expired</span>
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            </div>
          </div>
          <span className="text-3xl font-bold text-red-600">
            {dashboardLoading ? (
              <span className="animate-pulse text-slate-400">...</span>
            ) : expiredStock !== null ? (
              expiredStock.toLocaleString()
            ) : (
              "--"
            )}
          </span>
        </div>

        {/* Outstanding Payments Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Outstanding Payments</span>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            </div>
          </div>
          <span className="text-3xl font-bold text-green-600">
            {dashboardLoading ? (
              <span className="animate-pulse text-slate-400">...</span>
            ) : outstandingPayments !== null ? (
              outstandingPayments
            ) : (
              "--"
            )}
          </span>
        </div>

        {/* Sales Orders Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6 hover:shadow-xl transition-all duration-300 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Sales Orders</span>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
            </div>
          </div>
          {salesOrdersLoading ? (
            <span className="animate-pulse text-slate-400 text-3xl font-bold">...</span>
          ) : salesOrdersError ? (
            <span className="text-red-600 text-sm">{salesOrdersError}</span>
          ) : (
            <div className="space-y-2">
              <span className="text-3xl font-bold text-emerald-600">{salesOrdersKPIs.total.toLocaleString()}</span>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  Pending: <span className="font-medium text-slate-700">{salesOrdersKPIs.pending}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Total Value:{" "}
                  <span className="font-medium text-slate-700">₹{salesOrdersKPIs.totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Purchase Orders Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 p-6 hover:shadow-xl transition-all duration-300 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Purchase Orders</span>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-500 rounded-sm"></div>
            </div>
          </div>
          {purchaseOrdersLoading ? (
            <span className="animate-pulse text-slate-400 text-3xl font-bold">...</span>
          ) : purchaseOrdersError ? (
            <span className="text-red-600 text-sm">{purchaseOrdersError}</span>
          ) : (
            <div className="space-y-2">
              <span className="text-3xl font-bold text-indigo-600">{purchaseOrdersKPIs.total.toLocaleString()}</span>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  Pending: <span className="font-medium text-slate-700">{purchaseOrdersKPIs.pending}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Total Value:{" "}
                  <span className="font-medium text-slate-700">
                    ₹{purchaseOrdersKPIs.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Inventory Movements Accordion */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 mb-8 overflow-hidden">
        <button
          className={`w-full flex justify-between items-center px-8 py-6 focus:outline-none text-xl font-semibold transition-all duration-300 ${
            showInventory
              ? "bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border-b border-green-100/50"
              : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-blue-700"
          }`}
          onClick={() => setShowInventory((v) => !v)}
          aria-expanded={showInventory}
          aria-controls="inventory-accordion"
        >
          <span className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-4 transition-colors duration-300 ${showInventory ? "bg-green-500" : "bg-slate-300"}`}
            ></div>
            Recent Inventory Movements
          </span>
          <span className={`text-2xl transition-transform duration-300 ${showInventory ? "rotate-45" : ""}`}>+</span>
        </button>
        {showInventory && (
          <div id="inventory-accordion" className="px-8 pb-8">
            {dashboardLoading ? (
              <div className="text-slate-500 py-8 text-center">Loading...</div>
            ) : dashboardError ? (
              <div className="text-red-600 py-8 text-center">{dashboardError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Type</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Product</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Quantity</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentMovements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-slate-500 text-center">
                          No recent movements
                        </td>
                      </tr>
                    ) : (
                      recentMovements.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-4 py-4 text-slate-700">{item.date || "--"}</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {item.transaction_type || "--"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-700 font-medium">
                            {item.product_name || item.product || "--"}
                          </td>
                          <td className="px-4 py-4 text-slate-700">{item.quantity || "--"}</td>
                          <td className="px-4 py-4 text-slate-600 text-sm">{item.remarks || "--"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Sales Orders Accordion */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 mb-8 overflow-hidden">
        <button
          className={`w-full flex justify-between items-center px-8 py-6 focus:outline-none text-xl font-semibold transition-all duration-300 ${
            showSales
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-b border-green-100/50"
              : "text-slate-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700"
          }`}
          onClick={() => setShowSales((v) => !v)}
          aria-expanded={showSales}
          aria-controls="sales-accordion"
        >
          <span className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-4 transition-colors duration-300 ${showSales ? "bg-green-500" : "bg-slate-300"}`}
            ></div>
            Recent Sales Orders
          </span>
          <span className={`text-2xl transition-transform duration-300 ${showSales ? "rotate-45" : ""}`}>+</span>
        </button>
        {showSales && (
          <div id="sales-accordion" className="px-8 pb-8">
            {salesOrdersLoading ? (
              <div className="text-slate-500 py-8 text-center">Loading...</div>
            ) : salesOrdersError ? (
              <div className="text-red-600 py-8 text-center">{salesOrdersError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Customer</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-slate-500 text-center">
                          No recent sales orders
                        </td>
                      </tr>
                    ) : (
                      salesOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-4 py-4 text-slate-700">{order.order_date || "--"}</td>
                          <td className="px-4 py-4 text-slate-700 font-medium">
                            {order.customer_name ||
                              (order.customer && typeof order.customer === "object"
                                ? order.customer.name
                                : order.customer) ||
                              "--"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {order.status || "--"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-700 font-semibold">₹{order.total_amount || "--"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Purchase Orders Accordion */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 mb-8 overflow-hidden">
        <button
          className={`w-full flex justify-between items-center px-8 py-6 focus:outline-none text-xl font-semibold transition-all duration-300 ${
            showPurchase
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-b border-blue-100/50"
              : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
          }`}
          onClick={() => setShowPurchase((v) => !v)}
          aria-expanded={showPurchase}
          aria-controls="purchase-accordion"
        >
          <span className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-4 transition-colors duration-300 ${showPurchase ? "bg-blue-500" : "bg-slate-300"}`}
            ></div>
            Recent Purchase Orders
          </span>
          <span className={`text-2xl transition-transform duration-300 ${showPurchase ? "rotate-45" : ""}`}>+</span>
        </button>
        {showPurchase && (
          <div id="purchase-accordion" className="px-8 pb-8">
            {purchaseOrdersLoading ? (
              <div className="text-slate-500 py-8 text-center">Loading...</div>
            ) : purchaseOrdersError ? (
              <div className="text-red-600 py-8 text-center">{purchaseOrdersError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Supplier</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchaseOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-slate-500 text-center">
                          No recent purchase orders
                        </td>
                      </tr>
                    ) : (
                      purchaseOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-4 py-4 text-slate-700">{order.order_date || "--"}</td>
                          <td className="px-4 py-4 text-slate-700 font-medium">
                            {order.manufacturer_name ||
                              (order.manufacturer && typeof order.manufacturer === "object"
                                ? order.manufacturer.name
                                : order.manufacturer) ||
                              "--"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {order.status || "--"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-700 font-semibold">₹{order.total_amount || "--"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export async function clientLoader() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (!token) {
      return { redirect: "/login" }
    }
  }
  return null
}
