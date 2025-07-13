import { Link, useLocation } from "react-router";
import logo from "../media/logo_black.png";

interface SidebarProps {
  active: "dashboard" | "inventory" | "orders" | "reports";
  user: any;
  onProfileOpen: () => void;
  onLogout: () => void;
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar({ active, user, onProfileOpen, onLogout }: SidebarProps) {
  return (
    <aside className="w-72 bg-white/80 backdrop-blur-sm shadow-xl border-r border-blue-100/50 flex flex-col p-6 min-h-screen">
      {/* User Profile Section */}
      <div
        className="flex items-center gap-4 mb-8 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 rounded-xl p-3 transition-all duration-300 group"
        onClick={onProfileOpen}
        tabIndex={0}
        role="button"
        aria-label="View profile"
      >
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 text-white text-lg font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          {getInitials(user.first_name ? user.first_name + " " + (user.last_name || "") : user.username)}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">
            {user.first_name ? user.first_name + " " + (user.last_name || "") : user.username || "User"}
          </span>
          <span className="text-sm text-slate-500 group-hover:text-green-600 transition-colors duration-300">
            {user.role || "Role"}
          </span>
        </div>
      </div>

      {/* Logo Section */}
      <div className="flex items-center mb-10 px-3">
        <img src={logo || "/placeholder.svg"} alt="Aycertis Logo" className="h-10 mr-3" />
        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Life Sciences
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <Link
          to="/"
          className={`flex items-center px-4 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 ${
            active === "dashboard"
              ? "text-blue-700 bg-gradient-to-r from-blue-100 to-green-100 border-blue-200/50"
              : "text-slate-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 border-transparent group"
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-3 ${active === "dashboard" ? "bg-blue-500" : "bg-slate-300 group-hover:bg-blue-400 transition-colors duration-300"}`}></span>
          Dashboard
        </Link>
        <Link
          to="/inventory"
          className={`flex items-center px-4 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 ${
            active === "inventory"
              ? "text-blue-700 bg-gradient-to-r from-blue-100 to-green-100 border-blue-200/50"
              : "text-slate-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 border-transparent group"
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-3 ${active === "inventory" ? "bg-blue-500" : "bg-slate-300 group-hover:bg-blue-400 transition-colors duration-300"}`}></span>
          Inventory
        </Link>
        <Link
          to="/orders"
          className={`flex items-center px-4 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 ${
            active === "orders"
              ? "text-blue-700 bg-gradient-to-r from-blue-100 to-green-100 border-blue-200/50"
              : "text-slate-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 border-transparent group"
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-3 ${active === "orders" ? "bg-green-500" : "bg-slate-300 group-hover:bg-green-400 transition-colors duration-300"}`}></span>
          Orders
        </Link>
        <Link
          to="/reports"
          className={`flex items-center px-4 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 ${
            active === "reports"
              ? "text-blue-700 bg-gradient-to-r from-blue-100 to-green-100 border-blue-200/50"
              : "text-slate-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 border-transparent group"
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-3 ${active === "reports" ? "bg-blue-500" : "bg-slate-300 group-hover:bg-blue-400 transition-colors duration-300"}`}></span>
          Reports
        </Link>
      </nav>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="mt-8 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
      >
        Logout
      </button>
    </aside>
  );
} 