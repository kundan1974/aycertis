"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import PurchaseOrderFormModal from "../components/PurchaseOrderFormModal"
import PurchaseOrderViewModal from "../components/PurchaseOrderViewModal"

export function PurchaseOrdersTab() {
  const navigate = useNavigate()
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<any>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  // Search/filter states
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")

  // Data states
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch orders
  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line
  }, [navigate])

  function fetchOrders() {
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }
    setLoading(true)
    setError("")
    fetch("/api/inventory/purchase-orders/", {
      headers: { Authorization: `Bearer ${token}` },
    })
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
        setOrders(orders)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load purchase orders")
        setLoading(false)
      })
  }

  // Add/Edit handlers
  function handleAdd() {
    setEditOrder(null)
    setModalOpen(true)
  }
  function handleEdit(order: any) {
    setEditOrder(order)
    setModalOpen(true)
  }
  function handleView(order: any) {
    setViewOrder(order)
    setViewModalOpen(true)
  }
  function handleModalClose() {
    setModalOpen(false)
    setEditOrder(null)
  }
  function handleViewModalClose() {
    setViewModalOpen(false)
    setViewOrder(null)
  }
  async function handleModalSubmit(data: any) {
    setModalLoading(true)
    setModalError("")
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }
    try {
      let res
      if (editOrder) {
        // Update
        res = await fetch(`/api/inventory/purchase-orders/${editOrder.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
      } else {
        // Create
        res = await fetch("/api/inventory/purchase-orders/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
      }
      if (res.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        navigate("/login", { replace: true })
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.message || "Failed to save purchase order")
      }
      setModalLoading(false)
      handleModalClose()
      fetchOrders()
    } catch (err: any) {
      setModalError(err.message || "Could not save purchase order")
      setModalLoading(false)
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const manufacturerText =
      order.manufacturer_name ||
      (order.manufacturer && typeof order.manufacturer === "object" && order.manufacturer.name) ||
      (order.manufacturer && typeof order.manufacturer === "string" ? order.manufacturer : "")
    const matchesSearch =
      !search ||
      (manufacturerText && manufacturerText.toLowerCase().includes(search.toLowerCase())) ||
      (order.id && order.id.toString().includes(search))
    const matchesStatus = !status || order.status === status
    const matchesPayment = !paymentStatus || order.payment_status === paymentStatus
    return matchesSearch && matchesStatus && matchesPayment
  })

  // Badge color helpers
  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-700"
      case "received":
        return "bg-green-100 text-green-700"
      case "paid":
        return "bg-emerald-100 text-emerald-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }
  const paymentBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-green-100 text-green-700"
      case "partial":
        return "bg-amber-100 text-amber-700"
      case "paid":
        return "bg-emerald-100 text-emerald-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PurchaseOrderViewModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        order={viewOrder}
      />
      <PurchaseOrderFormModal
        open={modalOpen}
        onClose={handleModalClose}
        initialData={editOrder}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
        error={modalError}
      />
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Purchase Orders
          </h1>
          <p className="text-slate-600 mt-2">View, create, and manage purchase orders placed to manufacturers</p>
        </div>
        <button
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-green-600 hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
          onClick={handleAdd}
        >
          <span className="text-lg">+</span>
          Add Purchase Order
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Search</label>
            <input
              type="text"
              placeholder="Search by manufacturer or order #"
              className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Status</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 pr-10 border border-blue-200/50 rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Payment Status</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 pr-10 border border-blue-200/50 rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-green-50/80 border-b border-blue-100/50">
          <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Purchase Orders ({filteredOrders.length} items)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50/80 to-blue-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-slate-500 text-sm">Loading purchase orders...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-500 text-lg">!</span>
                      </div>
                      <span className="text-red-600 font-medium text-sm">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-400 text-lg">📋</span>
                      </div>
                      <span className="text-slate-500 text-sm">No purchase orders found</span>
                      <button className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-md text-xs hover:from-blue-600 hover:to-green-600 transition-all duration-300">
                        Create your first order
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-green-50/30 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white/50" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">#{order.id}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">#{order.id}</div>
                          <div className="text-xs text-slate-500">Order ID</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700 font-medium text-sm">{order.order_date || "--"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-xs">
                            {(
                              order.manufacturer_name ||
                              (order.manufacturer && typeof order.manufacturer === "object"
                                ? order.manufacturer.name
                                : order.manufacturer) ||
                              "M"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-slate-700 font-medium text-sm">
                          {order.manufacturer_name ||
                            (order.manufacturer && typeof order.manufacturer === "object"
                              ? order.manufacturer.name
                              : order.manufacturer) ||
                            "--"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                        {order.status || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${paymentBadge(order.payment_status)}`}
                      >
                        {order.payment_status || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700 font-semibold text-sm">₹{order.total_amount || "--"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700 text-sm">{order.payment_due_date || "--"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all duration-300 text-xs font-semibold shadow-sm hover:shadow-md"
                          onClick={() => handleView(order)}
                        >
                          View
                        </button>
                        <button
                          className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-md hover:from-green-200 hover:to-green-300 transition-all duration-300 text-xs font-semibold shadow-sm hover:shadow-md"
                          onClick={() => handleEdit(order)}
                        >
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-md hover:from-red-200 hover:to-red-300 transition-all duration-300 text-xs font-semibold shadow-sm hover:shadow-md">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
