export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}
