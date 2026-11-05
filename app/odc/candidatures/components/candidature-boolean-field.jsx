export default function CandidatureBooleanField({ manager, name, children }) {
  const error = manager.errors[name]
  return <fieldset className="min-w-0 space-y-3 rounded-lg border border-gray-200 p-4" aria-describedby={error ? `${name}-error` : undefined}>
    <legend className="max-w-full px-1 text-sm font-medium leading-6 text-gray-800">{children}<span aria-hidden="true" className="ml-1 text-[#e66f00]">*</span></legend>
    <div className="flex gap-3">{[[true, "Oui"], [false, "Non"]].map(([value, label]) => <label key={label}
      className={`flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${manager.values[name] === value ? "border-[#ff7900] bg-orange-50 text-gray-900" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}>
      <input type="radio" name={name} value={value ? "yes" : "no"} checked={manager.values[name] === value}
        onChange={() => manager.change(name, value)} ref={value ? (element) => { manager.fieldRefs.current[name] = element } : undefined}
        className="h-4 w-4 accent-[#ff7900]" aria-invalid={Boolean(error)} required />
      {label}
    </label>)}</div>
    {error && <p id={`${name}-error`} className="text-sm text-red-600">{error}</p>}
  </fieldset>
}
