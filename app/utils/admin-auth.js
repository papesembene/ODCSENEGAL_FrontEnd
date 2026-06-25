"use client"

export function getAdminAuthHeaders(headers = {}) {
  const requestHeaders = new Headers(headers)

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token")
    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }
  }

  return Object.fromEntries(requestHeaders.entries())
}
