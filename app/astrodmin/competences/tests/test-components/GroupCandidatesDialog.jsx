import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RefreshCw, Users } from "lucide-react"

export function GroupCandidatesDialog({
  open,
  onOpenChange,
  selectedGroup,
  candidates,
  loading,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Candidats du groupe : {selectedGroup?.name}</DialogTitle>
          <DialogDescription>
            {selectedGroup?.candidate_count || 0} candidat(s) dans ce groupe
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-sm text-muted-foreground">Chargement des candidats...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Users className="h-12 w-12 mb-2 opacity-20" />
              <p>Aucun candidat trouvé pour ce groupe</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        {candidate.first_name} {candidate.last_name}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
