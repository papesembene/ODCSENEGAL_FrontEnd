import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export const FIELD_CLASS = "min-h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#ff7900] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"

function SelectOptions({ options }) {
  return options.map((option) => {
    if (typeof option === "string") return <option key={option} value={option}>{option}</option>
    if (option.options) return <optgroup key={option.label} label={option.label}><SelectOptions options={option.options} /></optgroup>
    return <option key={option.value} value={option.value}>{option.label}</option>
  })
}

export default function CandidatureField({ manager, name, label, options, hint, placeholder, required = true, ...props }) {
  const error = manager.errors[name]
  const checking = manager.checking?.[name]?.checking
  const hasUniquenessCheck = ["email", "idNumber"].includes(name)
  const visibleHint = hint && !error
  const describedBy = [visibleHint && `${name}-hint`, error && `${name}-error`, checking && `${name}-checking`].filter(Boolean).join(" ") || undefined
  const shared = { id: name, name, value: manager.values[name] ?? "", onChange: manager.handleChange, onBlur: manager.blur,
    ref: (element) => { manager.fieldRefs.current[name] = element }, required, "aria-invalid": Boolean(error),
    "aria-describedby": describedBy, className: cn(FIELD_CLASS, checking && "pr-10", error && "border-red-500"), ...props }
  return <div className="min-w-0 space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-800">{label}
      {required && <span aria-hidden="true" className="ml-1 text-[#e66f00]">*</span>}
    </label>
    <div className="relative">
      {options ? <select {...shared}><option value="">{placeholder || "Sélectionnez une réponse"}</option><SelectOptions options={options} /></select>
        : <input {...shared} placeholder={placeholder} />}
      {checking && <span id={`${name}-checking`} role="status" className="pointer-events-none absolute right-3 top-3 text-gray-500">
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" /><span className="sr-only">Vérification en cours…</span>
      </span>}
    </div>
    {(hasUniquenessCheck || visibleHint || error) && <div className={hasUniquenessCheck ? "min-h-10" : undefined}>
      {visibleHint && <p id={`${name}-hint`} className="text-xs leading-5 text-gray-500">{hint}</p>}
      {error && <p id={`${name}-error`} className="text-sm text-red-600">{error}</p>}
    </div>}
  </div>
}
