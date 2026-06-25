import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Mail, RefreshCw, Copy, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export function InvitationDialog({
  open,
  onOpenChange,
  selectedGroupForInvitation,
  invitationDetails,
  setInvitationDetails,
  testsData,
  handleTestSelection,
  sendingInvitations,
  handleConfirmAndSendInvitations,
}) {
  const [testLinkBase, setTestLinkBase] = useState("")
  const [minTestDate, setMinTestDate] = useState("")

  useEffect(() => {
    setTestLinkBase(window.location.origin)
    setMinTestDate(new Date().toISOString().split("T")[0])
  }, [])

  const testLink = invitationDetails.test_id ? `${testLinkBase}/test/${invitationDetails.test_id}` : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Envoyer les invitations</DialogTitle>
          <DialogDescription>
            Configurez les détails du test avant d'envoyer les invitations à{" "}
            {selectedGroupForInvitation?.candidate_count} candidat(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2 -mr-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h4 className="font-medium mb-2">Groupe : {selectedGroupForInvitation?.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Formation :</span>
                <span className="ml-2 font-medium">{selectedGroupForInvitation?.formation}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Candidats :</span>
                <span className="ml-2 font-medium">{selectedGroupForInvitation?.candidate_count}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="invitation-test">
              Test à passer <span className="text-red-500">*</span>
            </Label>
            <Select value={invitationDetails.test_id} onValueChange={handleTestSelection}>
              <SelectTrigger id="invitation-test">
                <SelectValue placeholder="Sélectionnez un test" />
              </SelectTrigger>
              <SelectContent>
                {testsData.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun test disponible
                  </SelectItem>
                ) : (
                  testsData.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.title} ({test.referentiel}) - {test.scheduledDate ? `📅 ${test.scheduledDate}` : ""}{" "}
                      {test.scheduledTime ? `🕐 ${test.scheduledTime}` : ""} - {test.duration} min
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invitation-date">Date du test *</Label>
              <Input
                id="invitation-date"
                type="date"
                value={invitationDetails.test_date}
                onChange={(e) => setInvitationDetails({ ...invitationDetails, test_date: e.target.value })}
                min={minTestDate}
                disabled={!!invitationDetails.test_id}
                className={invitationDetails.test_id ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
            <div>
              <Label htmlFor="invitation-time">Heure de début *</Label>
              <Input
                id="invitation-time"
                type="time"
                value={invitationDetails.test_time}
                onChange={(e) => setInvitationDetails({ ...invitationDetails, test_time: e.target.value })}
                disabled={!!invitationDetails.test_id}
                className={invitationDetails.test_id ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="invitation-duration">Durée (minutes)</Label>
            <Input
              id="invitation-duration"
              type="number"
              min="5"
              max="300"
              value={invitationDetails.duration}
              onChange={(e) => setInvitationDetails({ ...invitationDetails, duration: parseInt(e.target.value) || 60 })}
              disabled={!!invitationDetails.test_id}
              className={invitationDetails.test_id ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
            />
          </div>

          {invitationDetails.test_id && (
            <div>
              <Label htmlFor="test-link">Lien du test</Label>
              <div className="flex gap-2">
                <Input
                  id="test-link"
                  type="text"
                  value={testLink}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(testLink).then(() => toast.success("Lien copié !"))
                  }}
                  disabled={!testLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="invitation-location">Lieu du test</Label>
            <Input
              id="invitation-location"
              value={invitationDetails.location}
              onChange={(e) => setInvitationDetails({ ...invitationDetails, location: e.target.value })}
              placeholder="Ex: En ligne, Salle A..."
            />
          </div>

          <div>
            <Label htmlFor="invitation-instructions">Instructions particulières</Label>
            <Textarea
              id="invitation-instructions"
              value={invitationDetails.instructions}
              onChange={(e) => setInvitationDetails({ ...invitationDetails, instructions: e.target.value })}
              placeholder="Instructions à communiquer aux candidats..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sendingInvitations}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmAndSendInvitations}
            disabled={sendingInvitations || !invitationDetails.test_id || !invitationDetails.test_date || !invitationDetails.test_time}
          >
            {sendingInvitations ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Confirmer et envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
