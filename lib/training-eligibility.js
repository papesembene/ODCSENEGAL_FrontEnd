import { RESIDENCE_LOCATIONS } from "../data/residence-locations.js"

export { RESIDENCE_LOCATIONS }
const LEGACY_RESTRICTED_LOCATIONS = ["Thiès", "Diamniadio", "Tambacounda"]
const LEGACY_ASSIGNMENTS = { "dev-data": ["Thiès", "Diamniadio"], "referent-digital": ["Tambacounda"],
  fibre: ["Tambacounda"], "fibre-optique": ["Tambacounda"] }

export function validateRegionalRules(value) {
  if (value === undefined) return { residenceRegions: RESIDENCE_LOCATIONS }
  if (!value || !Array.isArray(value.regions) || value.regions.some((item) => typeof item !== "string")
    || (value.residenceRegions !== undefined && (!Array.isArray(value.residenceRegions)
      || !value.residenceRegions.length || value.residenceRegions.some((item) => typeof item !== "string" || !item.trim())))
    || !value.defaults || typeof value.defaults !== "object" || Array.isArray(value.defaults)
    || Object.values(value.defaults).some((items) => !Array.isArray(items) || items.some((item) => typeof item !== "string"))) {
    throw new Error("Les régions / localités de résidence sont indisponibles.")
  }
  return { ...value, residenceRegions: value.residenceRegions || RESIDENCE_LOCATIONS }
}

export function regionToken(value) {
  const normalized = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()
  return normalized === "tamba" ? "tambacounda" : normalized
}

export function withResidenceEligibility(training) {
  if (training.applicationRegionMode !== undefined) return training
  // Compatibility with the old partial rules, never used for new admin settings.
  const assignments = training.applicationRegions || LEGACY_ASSIGNMENTS[training.code] || []
  return { ...training, applicationRegionMode: "selected", applicationRegions: RESIDENCE_LOCATIONS
    .filter((location) => !LEGACY_RESTRICTED_LOCATIONS.includes(location) || assignments.includes(location)) }
}

export function trainingAllowedInRegion(training, region, residenceLocations = RESIDENCE_LOCATIONS) {
  const selected = regionToken(region)
  if (!selected || !residenceLocations.some((value) => regionToken(value) === selected)) return false
  const policy = withResidenceEligibility(training)
  return policy.applicationRegionMode === "all" || (policy.applicationRegionMode === "selected"
    && (policy.applicationRegions || []).some((value) => regionToken(value) === selected))
}

export function eligibleTrainings(items, region, gender, residenceLocations = RESIDENCE_LOCATIONS) {
  return items.filter((item) => item.status === "published" && trainingAllowedInRegion(item, region, residenceLocations)
    && !(item.femaleOnly && gender === "male"))
}
