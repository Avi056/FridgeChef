import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setUser(null);
        window.location.href = "/login";
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
