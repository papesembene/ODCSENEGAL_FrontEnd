import { AlertCircle, FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

function formatFileSize(size) {
  if (!size) return "0 MB"
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

export default function FileUploadField({
  id,
  name,
  label,
  required,
  file,
  error,
  onChange,
  onClear,
  accept,
  helperText,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor={id}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
              error ? "border-red-500" : "border-gray-300"
            } border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <FileText className="w-8 h-8 mb-3 text-green-500" />
                  <p className="mb-2 text-sm text-green-500 font-semibold">Fichier sélectionné</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  {helperText ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
                  ) : null}
                </>
              )}
            </div>
            <input id={id} name={name} type="file" onChange={onChange} className="hidden" accept={accept} required={required} />
          </label>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {file ? (
          <Button type="button" variant="outline" size="sm" onClick={onClear} className="w-full md:w-auto">
            Changer de document
          </Button>
        ) : null}
      </div>
    </div>
  )
}
