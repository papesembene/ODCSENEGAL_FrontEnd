export function calculateAge(dateOfBirth, today = new Date()) {
  if (typeof dateOfBirth !== "string" || !(today instanceof Date) || !Number.isFinite(today.getTime())) return null
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth)
  if (!parts) return null

  const [year, month, day] = parts.slice(1).map(Number)
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return null

  const currentYear = today.getUTCFullYear()
  const currentMonth = today.getUTCMonth() + 1
  const currentDay = today.getUTCDate()
  if (year > currentYear || (year === currentYear && month > currentMonth)
    || (year === currentYear && month === currentMonth && day > currentDay)) return null

  const birthdayPending = month > currentMonth || (month === currentMonth && day > currentDay)
  return currentYear - year - (birthdayPending ? 1 : 0)
}

export function parseTrainingAgeRule(level) {
  if (typeof level !== "string") return null
  const text = level.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim()
  const agePrefix = String.raw`\bage(?:e|\s*\(\s*e\s*\))?\s+de\s*`
  const patterns = [
    [new RegExp(agePrefix + String.raw`(\d{1,3})\s*a\s*(\d{1,3})\s*ans?\b`, "g"), "range"],
    [new RegExp(String.raw`(?:${agePrefix})?(?:\bplus\s+de|\+\s*de)\s*(\d{1,3})\s*ans?\b`, "g"), "over"],
  ]
  const rules = []
  const spans = []
  for (const [pattern, kind] of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (/\b(?:pas|non|au)\s*$/.test(text.slice(0, match.index))) return null
      const minAge = Number(match[1])
      const maxAge = kind === "range" ? Number(match[2]) : null
      if (minAge > 120 || (maxAge !== null && (minAge > maxAge || maxAge > 120))) return null
      rules.push({ kind, minAge, maxAge })
      spans.push([match.index, match.index + match[0].length])
    }
  }
  const distinct = new Map(rules.map((rule) => [`${rule.kind}:${rule.minAge}:${rule.maxAge}`, rule]))
  if (distinct.size !== 1) return null
  for (const match of text.matchAll(/\bage(?:e|\s*\(\s*e\s*\))?\b/g)) {
    if (!spans.some(([start, end]) => start <= match.index && match.index < end)) return null
  }
  return distinct.values().next().value
}

export function formatTrainingAgeRule(rule) {
  if (!rule) return "Règle d’âge à vérifier dans le référentiel"
  return rule.kind === "range" ? `De ${rule.minAge} à ${rule.maxAge} ans inclus` : `Plus de ${rule.minAge} ans`
}

export function classifyCandidateAge(dateOfBirth, level, today = new Date()) {
  const age = calculateAge(dateOfBirth, today)
  const rule = parseTrainingAgeRule(level)
  if (age === null) return { eligibility: "unknown", age, reason: "invalid_birth_date", rule }
  if (!rule) return { eligibility: "unknown", age, reason: "missing_age_rule", rule }

  let eligible
  if (rule.kind === "range") {
    eligible = age >= rule.minAge && age <= rule.maxAge
  } else {
    const [year, month, day] = dateOfBirth.split("-").map(Number)
    const birthday = new Date(0)
    birthday.setUTCFullYear(year + rule.minAge, month - 1, day)
    birthday.setUTCHours(0, 0, 0, 0)
    const currentDay = new Date(today)
    currentDay.setUTCHours(0, 0, 0, 0)
    eligible = currentDay.getTime() > birthday.getTime()
  }
  return { eligibility: eligible ? "eligible" : "ineligible", age, reason: eligible ? null : "age_outside_rule", rule }
}
