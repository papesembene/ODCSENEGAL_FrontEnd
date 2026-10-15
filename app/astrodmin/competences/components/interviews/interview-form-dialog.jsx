import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function InterviewFormDialog({
  open, onOpenChange, title, description, submitting, onSubmit, submitLabel, children,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const result = await onSubmit()
      if (result) onOpenChange(false)
    } catch {
      // The mutation handler shows the error and retains the form for retry.
    }
  }
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!submitting) onOpenChange(value) }}>
      <DialogContent className="max-h-[90dvh] max-w-xl gap-0 overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex max-h-[90dvh] min-h-0 flex-col">
          <DialogHeader className="shrink-0 border-b px-6 py-5 pr-10">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 space-y-5 overflow-y-auto p-6">{children}</div>
          <DialogFooter className="shrink-0 gap-2 border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {submitting ? "Enregistrement…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
