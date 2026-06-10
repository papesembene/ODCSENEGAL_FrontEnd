import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CompetencesSuccessModal({ open, onOpenChange, successMessage }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{successMessage.title}</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-green-50 p-6 dark:bg-green-900/20">
          <div className="space-y-2">
            {successMessage.message.split("\n").map((line, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                {line}
              </p>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
