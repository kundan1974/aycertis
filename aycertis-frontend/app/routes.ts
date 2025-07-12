import { type RouteConfig, index, route } from "@react-router/dev/routes";

function requireAuth({ location }: { location: Location }) {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return { redirect: "/login" };
    }
  }
  return null;
}

function redirectIfAuth() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      return { redirect: "/" };
    }
  }
  return null;
}

export default [
  route("/login", "routes/login.tsx"),
  index("routes/home.tsx"),
] satisfies RouteConfig;
