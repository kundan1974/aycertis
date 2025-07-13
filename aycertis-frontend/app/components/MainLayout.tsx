import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  active: "dashboard" | "inventory" | "orders" | "reports";
  children: React.ReactNode;
}

export default function MainLayout({ active, children }: MainLayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
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
      .catch(() => {
        setProfileError("Could not load profile");
        setLoadingProfile(false);
      });
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <Sidebar active={active} user={user} onProfileOpen={() => setProfileOpen(true)} onLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
      {/* User Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100/50 p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl transition-colors duration-200"
              onClick={() => setProfileOpen(false)}
              aria-label="Close profile"
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 text-white text-2xl font-bold mb-4 shadow-lg">
                {user.first_name ? user.first_name.charAt(0) : user.username?.charAt(0) || "U"}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {user.first_name ? user.first_name + " " + (user.last_name || "") : user.username || "User"}
              </h2>
              <span className="text-slate-500 text-sm px-3 py-1 bg-blue-100 rounded-full">{user.role || "Role"}</span>
            </div>
            {loadingProfile ? (
              <div className="text-slate-500 text-center">Loading...</div>
            ) : profileError ? (
              <div className="text-red-600 text-center">{profileError}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-600">Email:</span>
                  <span className="text-slate-800">{user.email || "-"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-600">Department:</span>
                  <span className="text-slate-800">{user.department || "-"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-600">Role:</span>
                  <span className="text-slate-800">{user.role || "-"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 