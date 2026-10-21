import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, Send } from "lucide-react"
import { InvitationDeliveryStatus } from "./InvitationDeliveryStatus"

export function EmailDialog({
  open,
  onOpenChange,
  selectedResults,
  emailType,
  setEmailType,
  customMessage,
  setCustomMessage,
  sendingEmails,
  handleSendEmails,
  batchId,
  resetBatch,
}) {
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!sendingEmails) { if (!value) resetBatch(); onOpenChange(value) } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer un email aux candidats sélectionnés</DialogTitle>
          <DialogDescription>{selectedResults.length} candidat(s) sélectionné(s)</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailType">Type d'email</Label>
            <Select value={emailType} onValueChange={(value) => { resetBatch(); setEmailType(value) }} disabled={sendingEmails}>
              <SelectTrigger id="emailType">
                <SelectValue placeholder="Sélectionner le type d'email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interview_invitation">Invitation à l'entretien</SelectItem>
                <SelectItem value="acceptance">Test : seuil atteint</SelectItem>
                <SelectItem value="rejection">Test : seuil non atteint</SelectItem>
                <SelectItem value="results_notification">Notification des résultats</SelectItem>
                <SelectItem value="information">Information générale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="customMessage">Message personnalisé (optionnel)</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => { resetBatch(); setCustomMessage(e.target.value) }}
              disabled={sendingEmails}
              maxLength={5000}
              placeholder="Ajoutez un message personnalisé..."
              rows={4}
            />
          </div>
          {batchId ? <InvitationDeliveryStatus endpoint={`/api/admin/tests/notifications/${batchId}`} title="Suivi des envois" /> : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => { resetBatch(); onOpenChange(false) }}
              disabled={sendingEmails}
            >
              {batchId ? "Fermer" : "Annuler"}
            </Button>
            <Button onClick={handleSendEmails} disabled={!emailType || sendingEmails || !!batchId}>
              {sendingEmails ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
