"use client"

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import MainLayout from "../components/MainLayout";

interface Product {
  id: number
  name: string
  category: string
  hsn_code: string
  unit: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Manufacturer {
  id: number
  name: string
}

export default function Inventory() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [user, setUser] = useState<any>({})
  const [profileOpen, setProfileOpen] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState("")
  const [category, setCategory] = useState("")
  const [isActive, setIsActive] = useState("")
  const [form, setForm] = useState({
    name: "",
    category: "",
    hsn_code: "",
    unit: "",
    is_active: true,
  })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [deleteError, setDeleteError] = useState("")
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }
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
    if (!token) {
      navigate("/login", { replace: true })
      return
    }
    setLoading(true)
    setError("")
    // Fetch manufacturers for filter dropdown
    fetch("/api/inventory/manufacturers/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) throw new Error("Failed to fetch manufacturers")
        return res.json()
      })
      .then((data) => {
        if (data) setManufacturers(data)
      })
      .catch(() => setError("Could not load manufacturers"))
  }, [navigate])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line
  }, [selectedManufacturer, dateFrom, dateTo])

  function fetchProducts() {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setLoading(true);
    setError("");
    let url;
    if (selectedManufacturer) {
      url = `/api/inventory/products/by-manufacturer/?manufacturer=${selectedManufacturer}`;
    } else {
      url = "/api/inventory/products/?";
      if (category) url += `category=${encodeURIComponent(category)}&`;
      if (isActive) url += `is_active=${isActive}&`;
    }
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        let products = Array.isArray(data) ? data : data.results || [];
        if (search.trim()) {
          const term = search.trim().toLowerCase();
          products = products.filter(
            (p: any) =>
              p.name.toLowerCase().includes(term) ||
              (p.category && p.category.toLowerCase().includes(term)) ||
              (p.hsn_code && p.hsn_code.toLowerCase().includes(term))
          );
        }
        setProducts(products);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load products");
        setLoading(false);
      });
  }

  function openCreateModal() {
    setForm({ name: "", category: "", hsn_code: "", unit: "", is_active: true })
    setFormError("")
    setShowCreateModal(true)
  }
  function openEditModal(product: Product) {
    setForm({
      name: product.name,
      category: product.category,
      hsn_code: product.hsn_code,
      unit: product.unit,
      is_active: product.is_active,
    })
    setEditProduct(product)
    setFormError("")
    setShowEditModal(true)
  }
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((prev) => ({ ...prev, [name]: fieldValue }));
  }
  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    const token = localStorage.getItem("access_token")
    fetch("/api/inventory/products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || "Failed to create product")
        }
        return res.json()
      })
      .then(() => {
        setShowCreateModal(false)
        fetchProducts()
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setFormLoading(false))
  }
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editProduct) return
    setFormLoading(true)
    setFormError("")
    const token = localStorage.getItem("access_token")
    fetch(`/api/inventory/products/${editProduct.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || "Failed to update product")
        }
        return res.json()
      })
      .then(() => {
        setShowEditModal(false)
        setEditProduct(null)
        fetchProducts()
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setFormLoading(false))
  }
  function handleDelete(product: Product) {
    setDeleteProduct(product)
    setDeleteError("")
  }
  function confirmDelete() {
    if (!deleteProduct) return
    setDeletingId(deleteProduct.id)
    const token = localStorage.getItem("access_token")
    fetch(`/api/inventory/products/${deleteProduct.id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        setDeletingId(null)
        if (res.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login", { replace: true })
          return null
        }
        if (!res.ok) {
          let msg = "Failed to delete product"
          try {
            const data = await res.json()
            msg = data.detail || msg
          } catch {}
          setDeleteError(msg)
          return
        }
        setDeleteProduct(null)
        fetchProducts()
      })
      .catch((err) => setDeleteError(err.message))
  }
  function handleLogout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/login", { replace: true })
  }

  return (
    <MainLayout active="inventory">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-slate-600 mt-2">Manage your product inventory and stock levels</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-green-600 hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Product
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Manufacturer</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 pr-10 border border-blue-200/50 rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                >
                  <option value="">All Manufacturers</option>
                  {manufacturers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Search</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Search by name, category, or HSN code..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  if (searchTimeout) clearTimeout(searchTimeout);
                  setSearchTimeout(setTimeout(fetchProducts, 300)); // debounce
                }}
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-green-50/80 border-b border-blue-100/50">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Product Inventory ({products.length} items)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50/80 to-blue-50/80">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">HSN Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="text-slate-500">Loading products...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-500 text-xl">!</span>
                        </div>
                        <span className="text-red-600 font-medium">{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-slate-400 text-xl">📦</span>
                        </div>
                        <span className="text-slate-500">No products found</span>
                        <button
                          onClick={openCreateModal}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg text-sm hover:from-blue-600 hover:to-green-600 transition-all duration-300"
                        >
                          Add your first product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-green-50/30 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white/50" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{product.name}</div>
                            <div className="text-xs text-slate-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded text-sm">
                          {product.hsn_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700 font-medium">{product.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              product.is_active
                                ? "bg-green-400 shadow-green-200 shadow-lg"
                                : "bg-red-400 shadow-red-200 shadow-lg"
                            }`}
                          ></div>
                          <span
                            className={`text-sm font-medium ${product.is_active ? "text-green-700" : "text-red-700"}`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
                          >
                            Edit
                          </button>
                          {user.role === "admin" && (
                            <button
                              onClick={() => handleDelete(product)}
                              className="px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-lg hover:from-red-200 hover:to-red-300 transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
                              disabled={deletingId === product.id}
                            >
                              {deletingId === product.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100/50 p-8 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
                  <p className="text-slate-500 text-sm">Fill in the details to add a new product.</p>
                </div>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="e.g. Analgesic, Supplement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    name="hsn_code"
                    value={form.hsn_code}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter HSN code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="e.g. box, bottle, jar"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleFormChange}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    id="is_active_create"
                  />
                  <label htmlFor="is_active_create" className="text-sm text-slate-700">Active</label>
                </div>
                {formError && <div className="text-red-600 text-sm">{formError}</div>}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 font-medium"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium"
                    disabled={formLoading}
                  >
                    {formLoading ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100/50 p-8 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">✏️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Edit Product</h2>
                  <p className="text-slate-500 text-sm">{editProduct.name}</p>
                </div>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="e.g. Analgesic, Supplement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    name="hsn_code"
                    value={form.hsn_code}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter HSN code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-blue-200/50 rounded-xl bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="e.g. box, bottle, jar"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleFormChange}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    id="is_active_edit"
                  />
                  <label htmlFor="is_active_edit" className="text-sm text-slate-700">Active</label>
                </div>
                {formError && <div className="text-red-600 text-sm">{formError}</div>}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 font-medium"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium"
                    disabled={formLoading}
                  >
                    {formLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100/50 p-8 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">🗑️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Delete Product</h2>
                  <p className="text-slate-500 text-sm">Are you sure you want to delete <span className="font-semibold text-red-600">{deleteProduct.name}</span>?</p>
                </div>
              </div>
              {deleteError && <div className="text-red-600 text-sm mb-4">{deleteError}</div>}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteProduct(null)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 font-medium"
                  disabled={deletingId === deleteProduct.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
                  disabled={deletingId === deleteProduct.id}
                >
                  {deletingId === deleteProduct.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
