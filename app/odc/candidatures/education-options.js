const LOWER_EDUCATION = [
  { value: "cm2", label: "CM2" },
  { value: "4ème", label: "4ème" },
  { value: "3ème", label: "Troisième (sans BFEM)" },
  { value: "bfem", label: "BFEM" },
]

const BASE_EDUCATION = [
  { value: "terminale", label: "Terminale (avec ou sans le BAC)" }, { value: "bts", label: "BTS / Bac+2" },
  ...[1, 2, 3].map((year) => ({ value: `licence${year}`, label: `Licence ${year} / Bac+${year} ou équivalent` })),
  ...[1, 2].map((year) => ({ value: `master${year}`, label: `Master ${year} / Bac+${year + 3} ou équivalent` })),
]

const ALL_EDUCATION = [...LOWER_EDUCATION, ...BASE_EDUCATION]
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

export function educationOptions(training) {
  const requirement = normalize(typeof training === "object" ? training?.level : "")

  if (/pas de niveau requis|aucun niveau requis/.test(requirement)) return ALL_EDUCATION
  if (/troisieme|3eme|bfem/.test(requirement)) {
    return [...LOWER_EDUCATION.filter((item) => ["3ème", "bfem"].includes(item.value)), ...BASE_EDUCATION]
  }
  if (/bac\s*\+\s*2|bts/.test(requirement)) {
    return BASE_EDUCATION.filter((item) => ["bts", "licence2", "licence3", "master1", "master2"].includes(item.value))
  }
  if (/licence/.test(requirement)) {
    return BASE_EDUCATION.filter((item) => ["licence3", "master1", "master2"].includes(item.value))
  }
  if (/terminal/.test(requirement)) return BASE_EDUCATION

  // An unknown or empty catalogue requirement must not hide valid education levels.
  return ALL_EDUCATION
}

export function structureOptions(formation) {
  const structures = [
    { value: "universite", label: "Université" },
    { value: "lycee", label: "Lycée" },
    { value: "ecole-formation", label: "École de formation" },
  ]
  if (formation === "hackeuses") return [structures[2], structures[1],
    { value: "college", label: "Collège" }, { value: "primaire", label: "Primaire" }]
  return ["aws-cloud", "cyber-security", "intelligence-artificielle"].includes(formation)
    ? [structures[2], structures[0]] : structures
}
