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
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
const FROM_THIRD_GRADE = [...LOWER_EDUCATION.filter((item) => ["3ème", "bfem"].includes(item.value)), ...BASE_EDUCATION]
const FROM_FOURTH_GRADE = [...LOWER_EDUCATION.filter((item) => ["4ème", "3ème", "bfem"].includes(item.value)), ...BASE_EDUCATION]
const FROM_BFEM = [...LOWER_EDUCATION.filter((item) => item.value === "bfem"), ...BASE_EDUCATION]
const fromBase = (values) => BASE_EDUCATION.filter((item) => values.includes(item.value))

export function educationRequirement(training) {
  return String(training?.level || "")
}

export function educationOptions(training) {
  const requirement = normalize(educationRequirement(training))

  if (/pas de niveau requis|aucun niveau requis|sans niveau requis|pas de prerequis|aucun prerequis|sans prerequis/.test(requirement)) return ALL_EDUCATION
  if (/cm2/.test(requirement)) return ALL_EDUCATION
  if (/4eme|quatrieme/.test(requirement)) return FROM_FOURTH_GRADE
  if (/troisieme|3eme/.test(requirement)) return FROM_THIRD_GRADE
  if (/bfem/.test(requirement)) return FROM_BFEM
  if (/bac\s*2|bts/.test(requirement)) return fromBase(["bts", "licence2", "licence3", "master1", "master2"])
  if (/licence\s*1/.test(requirement)) return fromBase(["licence1", "licence2", "licence3", "master1", "master2"])
  if (/licence\s*2/.test(requirement)) return fromBase(["licence2", "licence3", "master1", "master2"])
  if (/licence|bac\s*3/.test(requirement)) return fromBase(["licence3", "master1", "master2"])
  if (/master\s*1|bac\s*4/.test(requirement)) return fromBase(["master1", "master2"])
  if (/master|bac\s*5/.test(requirement)) return fromBase(["master2"])
  if (/terminal|bac|baccalaureat/.test(requirement)) return BASE_EDUCATION

  // Unknown or missing requirements do not expose lower school levels by default.
  return BASE_EDUCATION
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
