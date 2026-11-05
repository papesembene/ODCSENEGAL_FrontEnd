import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RESIDENCE_LOCATIONS } from "@/data/residence-locations"

export default function TrainingResidenceFields({ manager }) {
  const { form, update, catalog } = manager
  const locations = catalog.regionalRules?.residenceRegions || RESIDENCE_LOCATIONS
  return <fieldset className="space-y-4 rounded-lg border p-4">
    <legend className="px-1 text-sm font-semibold">Région / localité de résidence</legend>
    <div className="grid gap-3 sm:grid-cols-2">{[
      ["all", "Tous les lieux de résidence"], ["selected", "Uniquement les lieux sélectionnés"],
    ].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="radio" name="training-residence-mode" value={value} checked={form.applicationRegionMode === value}
        onChange={() => update("applicationRegionMode", value)} className="h-4 w-4 accent-[#ff7900]" />{label}
    </label>)}</div>
    {form.applicationRegionMode === "selected" && <div className="grid gap-x-5 gap-y-3 border-t pt-4 sm:grid-cols-2 md:grid-cols-3">
      {locations.map((location) => <div key={location} className="flex min-h-8 items-center gap-2">
        <Checkbox id={`training-residence-${location}`} checked={form.applicationRegions.includes(location)}
          onCheckedChange={(checked) => update("applicationRegions", checked === true
            ? [...new Set([...form.applicationRegions, location])]
            : form.applicationRegions.filter((value) => value !== location))} />
        <Label htmlFor={`training-residence-${location}`}>{location}</Label>
      </div>)}
    </div>}
  </fieldset>
}
