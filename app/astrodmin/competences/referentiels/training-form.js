export const TRAINING_STATUSES = { published: "Publié", draft: "Brouillon", archived: "Archivé" }
export const TRAINING_FIELDS = [
  { name: "title", label: "Nom du référentiel", max: 200, required: true },
  { name: "durationMonths", label: "Durée (mois)", type: "number", min: 1, max: 36, required: true },
  { name: "level", label: "Niveau requis", max: 500 },
  { name: "location", label: "Lieu ou mode de formation", max: 300 },
  { name: "startDate", label: "Début prévu", max: 100 },
  { name: "endDate", label: "Fin prévue", max: 100 },
  { name: "displayOrder", label: "Ordre d'affichage", type: "number", min: 0, max: 10000, required: true },
]

export function trainingForm(item) {
  return {
    title: item?.title || "", description: item?.description || "",
    durationMonths: String(item?.durationMonths || ""), level: item?.level || "",
    careers: item?.careers || "", location: item?.location || "",
    startDate: item?.startDate || "", endDate: item?.endDate || "",
    skills: (item?.skills || []).join("\n"), femaleOnly: item?.femaleOnly || false,
    status: item?.status || "published", displayOrder: String(item?.displayOrder ?? 0), imageUrl: item?.imageUrl || "",
    applicationRegions: [...(item?.applicationRegions || [])],
    applicationRegionMode: item?.applicationRegionMode || "all",
  }
}

export function trainingPayload(form, version) {
  if (!["all", "selected"].includes(form.applicationRegionMode)) throw new Error("Choisissez les lieux de résidence autorisés.")
  if (form.applicationRegionMode === "selected" && !form.applicationRegions.length) {
    throw new Error("Sélectionnez au moins une région / localité de résidence.")
  }
  for (const [field, min, max] of [["durationMonths", 1, 36], ["displayOrder", 0, 10000]]) {
    if (!/^\d+$/.test(form[field]) || Number(form[field]) < min || Number(form[field]) > max) {
      throw new Error(`${field === "durationMonths" ? "La durée" : "L'ordre"} doit être compris entre ${min} et ${max}.`)
    }
  }
  return { ...form, title: form.title.trim(), durationMonths: Number(form.durationMonths),
    applicationRegions: form.applicationRegionMode === "all" ? [] : [...form.applicationRegions],
    displayOrder: Number(form.displayOrder), skills: form.skills.split("\n").map((line) => line.trim()).filter(Boolean),
    ...(version !== undefined ? { version } : {}),
  }
}
