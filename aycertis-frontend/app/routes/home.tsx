import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import logo from "../media/logo_black.png";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | Aycertis" },
    { name: "description", content: "Aycertis Inventory Dashboard" },
  ];
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Dashboard data states
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState<number | null>(null);
  const [expiredStock, setExpiredStock] = useState<number | null>(null);
  const [outstandingPayments, setOutstandingPayments] = useState<string | null>(null);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);

  // Sales & Purchase Orders
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(true);
  const [salesOrdersError, setSalesOrdersError] = useState("");
  const [salesOrdersKPIs, setSalesOrdersKPIs] = useState<{ total: number; pending: number; totalValue: number }>({ total: 0, pending: 0, totalValue: 0 });

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(true);
  const [purchaseOrdersError, setPurchaseOrdersError] = useState("");
  const [purchaseOrdersKPIs, setPurchaseOrdersKPIs] = useState<{ total: number; pending: number; totalValue: number }>({ total: 0, pending: 0, totalValue: 0 });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    // Fetch user profile
    setLoadingProfile(true);
    setProfileError("");
    fetch("/api/auth/profile/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
        setLoadingProfile(false);
      })
      .catch((err) => {
        setProfileError("Could not load profile");
        setLoadingProfile(false);
      });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setDashboardLoading(true);
    setDashboardError("");
    // Fetch all dashboard data in parallel
    Promise.all([
      fetch("/api/inventory/products/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/reports/low-stock/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/reports/expired-stock/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/reports/outstanding-payments/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/inventory/inventory-transactions/?limit=5", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([productsRes, lowStockRes, expiredRes, paymentsRes, movementsRes]) => {
        if ([productsRes, lowStockRes, expiredRes, paymentsRes, movementsRes].some(r => r.status === 401)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return;
        }
        if ([productsRes, lowStockRes, expiredRes, paymentsRes, movementsRes].some(r => !r.ok)) {
          throw new Error("Failed to fetch dashboard data");
        }
        const products = await productsRes.json();
        const lowStock = await lowStockRes.json();
        const expired = await expiredRes.json();
        const payments = await paymentsRes.json();
        const movements = await movementsRes.json();
        setTotalProducts(Array.isArray(products) ? products.length : (products.count || 0));
        setLowStock(Array.isArray(lowStock) ? lowStock.length : (lowStock.count || 0));
        setExpiredStock(Array.isArray(expired) ? expired.length : (expired.count || 0));
        setOutstandingPayments(
          payments && typeof payments === "object" && payments.total ? payments.total : "--"
        );
        setRecentMovements(Array.isArray(movements) ? movements.slice(0, 5) : (movements.results || []).slice(0, 5));
        setDashboardLoading(false);
      })
      .catch((err) => {
        setDashboardError("Could not load dashboard data");
        setDashboardLoading(false);
      });
  }, [navigate]);

  // Fetch Sales Orders
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setSalesOrdersLoading(true);
    setSalesOrdersError("");
    fetch("/api/inventory/sale-orders/?limit=5", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch sales orders");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const orders = Array.isArray(data) ? data : (data.results || []);
        setSalesOrders(orders);
        // KPIs
        setSalesOrdersKPIs({
          total: data.count || orders.length,
          pending: orders.filter((o: any) => o.status === "pending").length,
          totalValue: orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0),
        });
        setSalesOrdersLoading(false);
      })
      .catch(() => {
        setSalesOrdersError("Could not load sales orders");
        setSalesOrdersLoading(false);
      });
  }, [navigate]);

  // Fetch Purchase Orders
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setPurchaseOrdersLoading(true);
    setPurchaseOrdersError("");
    fetch("/api/inventory/purchase-orders/?limit=5", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch purchase orders");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const orders = Array.isArray(data) ? data : (data.results || []);
        setPurchaseOrders(orders);
        // KPIs
        setPurchaseOrdersKPIs({
          total: data.count || orders.length,
          pending: orders.filter((o: any) => o.status === "pending").length,
          totalValue: orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0),
        });
        setPurchaseOrdersLoading(false);
      })
      .catch(() => {
        setPurchaseOrdersError("Could not load purchase orders");
        setPurchaseOrdersLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col p-6 min-h-screen">
        {/* User Profile Section */}
        <div
          className="flex items-center gap-3 mb-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 transition"
          onClick={() => setProfileOpen(true)}
          tabIndex={0}
          role="button"
          aria-label="View profile"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-xl font-bold">
            {getInitials(user.first_name ? user.first_name + " " + (user.last_name || "") : user.username)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">{user.first_name ? user.first_name + " " + (user.last_name || "") : user.username || "User"}</span>
            <span className="text-xs text-gray-500 dark:text-gray-300">{user.role || "Role"}</span>
          </div>
        </div>
        <div className="flex items-center mb-10">
          <img src={logo} alt="Aycertis Logo" className="h-10 mr-2" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">Aycertis</span>
        </div>
        <nav className="flex-1 space-y-4">
          <a href="#" className="block px-3 py-2 rounded text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 font-semibold">Dashboard</a>
          <a href="#" className="block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Inventory</a>
          <a href="#" className="block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Orders</a>
          <a href="#" className="block px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Reports</a>
        </nav>
        <button onClick={handleLogout} className="mt-10 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Welcome{user.first_name ? `, ${user.first_name}` : ""}!
            </p>
          </div>
        </div>
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Stock Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">Total Products</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardLoading ? <span className="animate-pulse">...</span> : (totalProducts !== null ? totalProducts : "--")}
            </span>
          </div>
          {/* Low Stock Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">Low Stock</span>
            <span className="text-2xl font-bold text-yellow-500">
              {dashboardLoading ? <span className="animate-pulse">...</span> : (lowStock !== null ? lowStock : "--")}
            </span>
          </div>
          {/* Expired/Expiring Stock Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">Expiring/Expired</span>
            <span className="text-2xl font-bold text-red-500">
              {dashboardLoading ? <span className="animate-pulse">...</span> : (expiredStock !== null ? expiredStock : "--")}
            </span>
          </div>
          {/* Outstanding Payments Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">Outstanding Payments</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dashboardLoading ? <span className="animate-pulse">...</span> : (outstandingPayments !== null ? outstandingPayments : "--")}
            </span>
          </div>
          {/* Sales Orders Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start col-span-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">Sales Orders</span>
            {salesOrdersLoading ? (
              <span className="animate-pulse">...</span>
            ) : salesOrdersError ? (
              <span className="text-red-600 dark:text-red-400">{salesOrdersError}</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{salesOrdersKPIs.total}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Pending: {salesOrdersKPIs.pending}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Value: ₹{salesOrdersKPIs.totalValue.toLocaleString()}</span>
              </>
            )}
          </div>
          {/* Purchase Orders Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start col-span-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">Purchase Orders</span>
            {purchaseOrdersLoading ? (
              <span className="animate-pulse">...</span>
            ) : purchaseOrdersError ? (
              <span className="text-red-600 dark:text-red-400">{purchaseOrdersError}</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{purchaseOrdersKPIs.total}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Pending: {purchaseOrdersKPIs.pending}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Value: ₹{purchaseOrdersKPIs.totalValue.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
        {/* Recent Inventory Movements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Inventory Movements</h2>
          {dashboardLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : dashboardError ? (
            <div className="text-red-600 dark:text-red-400">{dashboardError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-gray-700 dark:text-gray-300 text-center">No recent movements</td>
                    </tr>
                  ) : (
                    recentMovements.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.date || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.transaction_type || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.product_name || item.product || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.quantity || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.remarks || "--"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Recent Sales Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Sales Orders</h2>
          {salesOrdersLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : salesOrdersError ? (
            <div className="text-red-600 dark:text-red-400">{salesOrdersError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-gray-700 dark:text-gray-300 text-center">No recent sales orders</td>
                    </tr>
                  ) : (
                    salesOrders.map((order, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{order.order_date || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {order.customer_name ||
                            (order.customer && typeof order.customer === "object"
                              ? order.customer.name
                              : order.customer) ||
                            "--"}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{order.status || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">₹{order.total_amount || "--"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Recent Purchase Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Purchase Orders</h2>
          {purchaseOrdersLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : purchaseOrdersError ? (
            <div className="text-red-600 dark:text-red-400">{purchaseOrdersError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-gray-700 dark:text-gray-300 text-center">No recent purchase orders</td>
                    </tr>
                  ) : (
                    purchaseOrders.map((order, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{order.order_date || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {order.manufacturer_name ||
                            (order.manufacturer && typeof order.manufacturer === "object"
                              ? order.manufacturer.name
                              : order.manufacturer) ||
                            "--"}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{order.status || "--"}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">₹{order.total_amount || "--"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      {/* User Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl"
              onClick={() => setProfileOpen(false)}
              aria-label="Close profile"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-3xl font-bold mb-2">
                {getInitials(user.first_name ? user.first_name + " " + (user.last_name || "") : user.username)}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {user.first_name ? user.first_name + " " + (user.last_name || "") : user.username || "User"}
              </h2>
              <span className="text-gray-500 dark:text-gray-300 text-sm">{user.role || "Role"}</span>
            </div>
            {loadingProfile ? (
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            ) : profileError ? (
              <div className="text-red-600 dark:text-red-400">{profileError}</div>
            ) : (
              <div className="space-y-2">
                <div><span className="font-semibold text-gray-700 dark:text-gray-200">Email:</span> <span className="text-gray-600 dark:text-gray-300">{user.email || "-"}</span></div>
                <div><span className="font-semibold text-gray-700 dark:text-gray-200">Department:</span> <span className="text-gray-600 dark:text-gray-300">{user.department || "-"}</span></div>
                <div><span className="font-semibold text-gray-700 dark:text-gray-200">Role:</span> <span className="text-gray-600 dark:text-gray-300">{user.role || "-"}</span></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export async function clientLoader() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return { redirect: "/login" };
    }
  }
  return null;
}
