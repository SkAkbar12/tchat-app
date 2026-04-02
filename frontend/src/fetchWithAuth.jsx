let refreshPromise = null;

export default async function fetchWithAuth(url, options = {}) {

  const token = localStorage.getItem("accessToken");

  const fetchWithToken = (token) => {

    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (!headers["Content-Type"] && options.body) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`http://localhost:3000/api/${url}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response = await fetchWithToken(token);

  if (response.status === 401) {

    if (!refreshPromise) {

      refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      })
      .then(async (res) => {

        if (!res.ok) {

          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          throw new Error("Session expired");

        }

        const data = await res.json();

        localStorage.setItem("accessToken", data.accessToken);

        return data.accessToken;

      })
      .finally(() => {

        refreshPromise = null;

      });
    }

    try {

      const newToken = await refreshPromise;

      response = await fetchWithToken(newToken);

    } catch (err) {

      console.log("Refresh failed:", err);
      throw err;

    }
  }

  return response;
}