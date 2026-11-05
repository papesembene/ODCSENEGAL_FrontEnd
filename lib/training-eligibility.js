import { RESIDENCE_LOCATIONS } from "../data/residence-locations.js"

export { RESIDENCE_LOCATIONS }
export const DEFAULT_TRAINING_SITES = [
  ["dakar", "Dakar"], ["thies", "Thiès"], ["diamniadio-uam", "Diamniadio / UAM"], ["tambacounda", "Tambacounda"],
].map(([code, name], index) => ({ code, name, description: "", status: "active", displayOrder: (index + 1) * 10, version: 0 }))

export function withSiteAssignments(training) {
  const { applicationRegions, applicationRegionMode, ...item } = training
  const defaults = { "dev-data": ["dakar", "thies", "diamniadio-uam"], "referent-digital": ["dakar", "tambacounda"],
    fibre: ["tambacounda"], "fibre-optique": ["tambacounda"] }
  return { ...item, siteIds: item.siteIds || defaults[item.code] || ["dakar"] }
}

export function validateTrainingSites(sites) {
  if (!Array.isArray(sites) || sites.some((site) => !site || typeof site.code !== "string"
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site.code) || typeof site.name !== "string" || !site.name.trim()
    || !["active", "archived"].includes(site.status)) || new Set(sites.map((site) => site.code)).size !== sites.length) {
    throw new Error("Les sites de formation sont indisponibles. Veuillez actualiser la page.")
  }
  return sites
}

export function eligibleTrainings(items, site, gender) {
  return items.filter((item) => item.status === "published" && withSiteAssignments(item).siteIds.includes(site)
    && !(item.femaleOnly && gender === "male"))
}

export function eligibleTrainingSites(sites, items, gender) {
  return sites.filter((site) => site.status === "active")
    .map((site) => ({ ...site, trainingCount: eligibleTrainings(items, site.code, gender).length }))
    .filter((site) => site.trainingCount > 0)
}
