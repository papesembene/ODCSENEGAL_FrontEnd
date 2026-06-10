import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RefreshCw, Trash, CheckCircle, XCircle, Clock } from "lucide-react"

const ITEMS_PER_PAGE_OPTIONS = ["10", "20", "30", "50", "100"]

const getVisiblePages = (totalPages, currentPage) => {
  return Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) return true
    if (page === 1 || page === totalPages) return true
    return Math.abs(page - currentPage) <= 1
  })
}

export function PageSizeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Afficher</span>
      <Select
        value={value.toString()}
        onValueChange={(nextValue) => {
          onChange(Number.parseInt(nextValue))
        }}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ITEMS_PER_PAGE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">par page</span>
    </div>
  )
}

export function PaginationControls({ page, itemsPerPage, totalItems, itemLabel, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (!totalItems) {
    return null
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Affichage de {Math.min((page - 1) * itemsPerPage + 1, totalItems)} à {Math.min(page * itemsPerPage, totalItems)} sur {totalItems} {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
          Précédent
        </Button>
        <div className="flex gap-1">
          {getVisiblePages(totalPages, page).map((visiblePage) => (
            <Button
              key={visiblePage}
              variant={page === visiblePage ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => onPageChange(visiblePage)}
            >
              {visiblePage}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}

export function GroupStatusBadge({ status, emailSent }) {
  if (status === "pending") {
    return <Badge variant="secondary">En attente</Badge>
  }

  if (status === "scheduled" && emailSent) {
    return (
      <Badge variant="outline" className="mr-2">
        <CheckCircle className="h-3 w-3 mr-1" />
        Envoyé le {new Date(emailSent).toLocaleDateString("fr-FR")}
      </Badge>
    )
  }

  if (status === "scheduled") {
    return <Badge className="bg-blue-500">Planifié</Badge>
  }

  if (status === "completed") {
    return <Badge className="bg-green-500">Terminé</Badge>
  }

  if (status === "cancelled") {
    return <Badge variant="destructive">Annulé</Badge>
  }

  return <Badge variant="outline">{status}</Badge>
}

export function ResultStatusBadge({ status }) {
  if (status === "selected") {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle className="h-3 w-3 mr-1" />
        Passe en entretien
      </Badge>
    )
  }

  if (status === "not_selected") {
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <XCircle className="h-3 w-3 mr-1" />
        Rejeté
      </Badge>
    )
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
      <Clock className="h-3 w-3 mr-1" />
      En attente
    </Badge>
  )
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
  warningText,
  isLoading,
  onCancel,
  onConfirm,
  confirmLabel,
  loadingLabel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {details}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{warningText}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {loadingLabel}
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
