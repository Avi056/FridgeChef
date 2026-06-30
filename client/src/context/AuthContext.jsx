import { useEffect, useMemo, useState } from "react";
import { api, clearAuthToken, setAuthToken } from "../lib/api";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.location.pathname === "/oauth/callback") {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");

      if (token) {
        setAuthToken(token);
      }

      window.history.replaceState(null, "", "/");
    }

    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: () => {
        window.location.href = `${api.apiUrl}/auth/google`;
      },
      logout: async () => {
        await api.logout();
        clearAuthToken();
        setUser(null);
        window.location.href = "/login";
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
