"use client"

import { useState } from "react"
import { KeyRound } from "lucide-react"
import { toast } from "sonner"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ChangePasswordDialog({ collapsed = false }) {
  const { makeRequest } = useAdminApi()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function changeOpen(value) {
    if (saving) return
    setError("")
    setOpen(value)
  }

  async function submit(event) {
    event.preventDefault()
    if (saving) return
    const form = new FormData(event.currentTarget)
    const currentPassword = form.get("current_password")
    const newPassword = form.get("new_password")
    if (newPassword !== form.get("confirmation")) {
      setError("Les deux nouveaux mots de passe doivent être identiques.")
      return
    }
    setError("")
    setSaving(true)
    try {
      const response = await makeRequest("/api/admin/me/password", {
        method: "PATCH",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      localStorage.setItem("admin_token", response.token)
      setOpen(false)
      toast.success("Mot de passe modifié.")
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label="Changer mon mot de passe" title={collapsed ? "Changer mon mot de passe" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
          <KeyRound className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Changer mon mot de passe</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Changer mon mot de passe</DialogTitle>
          <DialogDescription>Saisissez votre mot de passe actuel, puis choisissez un nouveau mot de passe d’au moins 8 caractères.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="account-current-password">Mot de passe actuel</Label>
            <Input id="account-current-password" name="current_password" type="password" autoComplete="current-password" required maxLength={1024} disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-new-password">Nouveau mot de passe</Label>
            <Input id="account-new-password" name="new_password" type="password" autoComplete="new-password" required minLength={8} maxLength={1024} disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-confirm-password">Confirmer le nouveau mot de passe</Label>
            <Input id="account-confirm-password" name="confirmation" type="password" autoComplete="new-password" required maxLength={1024} disabled={saving} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => changeOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
