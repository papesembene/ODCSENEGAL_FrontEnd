import trainingDefaults from "../data/training-defaults.js"
import { withResidenceEligibility } from "./training-eligibility.js"

export const DEFAULT_TRAININGS = trainingDefaults
export const PUBLIC_TRAININGS_PAGE_SIZE = 6
let knownTrainings = trainingDefaults

export function trainingToken(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()
}

export function setKnownTrainings(items) {
  knownTrainings = items
}

export function getKnownTrainings() {
  return knownTrainings
}

export function findTraining(value, items = knownTrainings) {
  const wanted = trainingToken(value)
  if (!wanted) return undefined
  return items.find((item) => [item.code, item.value, item.title, ...(item.aliases || [])]
    .some((alias) => trainingToken(alias) === wanted))
}

export function trainingOptions(items, valueKey = "code", includeArchived = false) {
  return items.filter((item) => includeArchived || item.status !== "archived")
    .map((item) => ({ value: item[valueKey], label: item.title, aliases: item.aliases }))
}

export function publicTrainingPage(items, { search = "", page = 1 } = {}) {
  const terms = trainingToken(search).split(" ").filter(Boolean)
  const filtered = items.filter((item) => item.status === "published"
    && terms.every((term) => trainingToken(item.title).includes(term)))
  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / PUBLIC_TRAININGS_PAGE_SIZE))
  const currentPage = Math.min(Number.isInteger(page) && page > 0 ? page : 1, pages)
  return { items: filtered.slice((currentPage - 1) * PUBLIC_TRAININGS_PAGE_SIZE, currentPage * PUBLIC_TRAININGS_PAGE_SIZE),
    total, pages, page: currentPage }
}

export function validateCatalogResponse(payload) {
  if (payload?.success !== true || !Array.isArray(payload.data) || payload.data.some((item) =>
    !item || typeof item.code !== "string" || typeof item.title !== "string" || typeof item.value !== "string"
      || !Array.isArray(item.skills) || !["published", "draft", "archived"].includes(item.status)
      || (item.applicationRegions !== undefined && (!Array.isArray(item.applicationRegions)
        || item.applicationRegions.some((region) => typeof region !== "string")))
      || (item.applicationRegionMode !== undefined && !["all", "selected"].includes(item.applicationRegionMode))
      || (item.applicationRegionMode === "selected" && !item.applicationRegions?.length))) {
    throw new Error("Le catalogue des référentiels est indisponible.")
  }
  return payload.data.map(withResidenceEligibility)
}
