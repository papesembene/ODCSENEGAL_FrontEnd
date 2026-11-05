const BASE_EDUCATION = [
  { value: "terminale", label: "Terminale" }, { value: "bts", label: "BTS" },
  ...[1, 2, 3].map((year) => ({ value: `licence${year}`, label: `Licence ${year} ou équivalent` })),
  ...[1, 2].map((year) => ({ value: `master${year}`, label: `Master ${year} ou équivalent` })),
]
const STRUCTURES = [
  { value: "universite", label: "Université" }, { value: "lycee", label: "Lycée" },
  { value: "ecole-formation", label: "École de formation" },
]

export function educationOptions(formation) {
  if (formation === "hackeuses") return [
    { value: "cm2", label: "CM2" }, { value: "4ème", label: "4ème" }, { value: "3ème", label: "3ème" },
    ...BASE_EDUCATION.filter((item) => item.value !== "bts"),
  ]
  return ["aws-cloud", "cyber-security", "intelligence-artificielle"].includes(formation)
    ? BASE_EDUCATION.filter((item) => ["licence3", "master1", "master2"].includes(item.value)) : BASE_EDUCATION
}

export function structureOptions(formation) {
  if (formation === "hackeuses") return [STRUCTURES[2], STRUCTURES[1],
    { value: "college", label: "Collège" }, { value: "primaire", label: "Primaire" }]
  return ["aws-cloud", "cyber-security", "intelligence-artificielle"].includes(formation)
    ? [STRUCTURES[2], STRUCTURES[0]] : STRUCTURES
}
