import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileDown, AlertCircle } from "lucide-react"

export function ImportDialog({
  open,
  onOpenChange,
  title,
  description,
  onImport,
  templateUrl,
  templateName,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300">Format Requis</p>
              <p className="text-blue-700/80 dark:text-blue-400/80 mt-1">
                Le fichier doit être au format CSV (délimiteur point-virgule) et suivre la structure du modèle.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href={templateUrl} download={templateName}>
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger le modèle CSV
              </a>
            </Button>

            <div className="relative">
              <input
                type="file"
                id="csv-upload"
                className="hidden"
                accept=".csv"
                onChange={onImport}
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour importer</span>
                  </p>
                  <p className="text-xs text-gray-400">Fichiers CSV uniquement</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
