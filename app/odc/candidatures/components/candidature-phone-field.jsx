import { countryCodes } from "../constants"
import { FIELD_CLASS } from "./candidature-field"
import { cn } from "@/lib/utils"

export default function CandidaturePhoneField({ manager }) {
  const error = manager.errors.phone
  return <div className="min-w-0 space-y-2">
    <label htmlFor="phone" className="block text-sm font-medium text-gray-800">Téléphone <span aria-hidden="true" className="text-[#e66f00]">*</span></label>
    <div className="flex min-w-0 gap-2">
      <select aria-label="Indicatif du téléphone" name="phoneCountry" value={manager.values.phoneCountry}
        onChange={manager.handleChange} className={cn(FIELD_CLASS, "w-28 shrink-0 px-2")}>
        {countryCodes.map((country) => <option key={country.abbr} value={country.abbr}>{country.abbr} {country.code} · {country.country}</option>)}
      </select>
      <input id="phone" name="phone" type="tel" autoComplete="tel-national" inputMode="tel" required
        ref={(element) => { manager.fieldRefs.current.phone = element }} value={manager.values.phone}
        onChange={manager.handleChange} onBlur={manager.blur} aria-invalid={Boolean(error)}
        aria-describedby={error ? "phone-error" : "phone-hint"}
        className={cn(FIELD_CLASS, error && "border-red-500")} placeholder={manager.selectedCountry.format} />
    </div>
    {error ? <p id="phone-error" className="text-sm text-red-600">{error}</p>
      : <p id="phone-hint" className="text-xs text-gray-500">Un numéro sur lequel vous pouvez être contacté.</p>}
  </div>
}
