export function privateDocumentUrl(apiUrl, path) {
  const normalized = String(path || "").replace(/\\/g, "/")
  const segments = normalized.split("/")
  if (!normalized || segments.some((part) => !part || part === "." || part === "..")) {
    throw new Error("Chemin de document invalide")
  }
  return `${apiUrl.replace(/\/$/, "")}/api/auth/documents/${segments.map(encodeURIComponent).join("/")}`
}

export async function downloadPrivateDocument({ apiUrl, path, filename, token }) {
  if (!token) throw new Error("Veuillez vous reconnecter")
  const response = await fetch(privateDocumentUrl(apiUrl, path), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    redirect: "error",
  })
  if (!response.ok) throw new Error("Document inaccessible ou session expirée")
  const url = URL.createObjectURL(await response.blob())
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename || "document"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
