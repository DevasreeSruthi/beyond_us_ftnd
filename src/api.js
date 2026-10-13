const BASE = import.meta.env.DEV
  ? "http://localhost:8080/api"
  : "https://beyond-us-backend.onrender.com/api";

async function request(path, options) {
  let res;

  try {
    res = await fetch(BASE + path, options);
  } catch {
    throw new Error("Cannot reach the backend. Please try again later.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  get: (path) => request(path),

  post: (path, body) =>
    request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }),
};