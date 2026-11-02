"use client"

import { useDeferredValue, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { useTrainingCatalog } from "@/components/trainings/training-catalog-provider"
import { trainingToken } from "@/lib/training-catalog"
import { trainingForm, trainingPayload } from "./training-form"

export default function useTrainingManagement() {
  const catalog = useTrainingCatalog()
  const { trainings: api } = useAdminApi()
  const [allowed, setAllowed] = useState(null)
  const [search, setSearch] = useState("")
  const searchText = useDeferredValue(search)
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(trainingForm())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [archiveTarget, setArchiveTarget] = useState(null)
  const mutation = useRef(false)

  useEffect(() => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin_user") || "{}")
      setAllowed(["super_admin", "competences"].includes(localStorage.getItem("admin_type"))
        && admin.profile_data?.admin_scope !== "interview_member")
    } catch { setAllowed(false) }
  }, [])

  function begin(item = null) {
    setEditing(item)
    setForm(trainingForm(item))
    setError("")
    setOpen(true)
  }

  async function mutate(operation, message) {
    if (mutation.current || !allowed) return
    mutation.current = true
    setBusy(true)
    setError("")
    try {
      await operation()
      setOpen(false)
      setArchiveTarget(null)
      localStorage.setItem("odc_training_catalog_updated", String(Date.now()))
      await catalog.refresh()
      toast.success(message)
    } catch (failure) {
      setError(failure.message)
      toast.error(failure.message)
    } finally { mutation.current = false; setBusy(false) }
  }

  function save(event) {
    event.preventDefault()
    return mutate(() => {
      const payload = trainingPayload(form, editing?.version)
      return editing ? api.update(editing.code, payload) : api.create(payload)
    }, editing ? "Référentiel mis à jour" : "Référentiel ajouté")
  }

  async function upload(file) {
    if (!file || mutation.current || !allowed) return
    if (file.size > 10 * 1024 * 1024) { setError("L'image ne doit pas dépasser 10 Mo."); return }
    mutation.current = true
    setBusy(true)
    setError("")
    try {
      const result = await api.uploadImage(file)
      setForm((previous) => ({ ...previous, imageUrl: result.data.imageUrl }))
    } catch (failure) { setError(failure.message) }
    finally { mutation.current = false; setBusy(false) }
  }

  const filtered = catalog.items.filter((item) => (status === "all" || item.status === status)
    && trainingToken(`${item.title} ${item.description}`).includes(trainingToken(searchText)))
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const currentPage = Math.min(page, pages)
  return {
    allowed, catalog, search, status, page: currentPage, pages, total: filtered.length,
    items: filtered.slice((currentPage - 1) * 10, currentPage * 10), setPage,
    changeSearch: (value) => { setSearch(value); setPage(1) },
    changeStatus: (value) => { setStatus(value); setPage(1) },
    editing, open, setOpen, form, busy, error, begin, save, upload,
    update: (field, value) => setForm((previous) => ({ ...previous, [field]: value })),
    archiveTarget, setArchiveTarget,
    archive: () => archiveTarget && mutate(() => api.archive(archiveTarget.code, archiveTarget.version), "Référentiel archivé : l'historique est conservé"),
  }
}
