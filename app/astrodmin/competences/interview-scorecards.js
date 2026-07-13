const DWM_FILTER_CRITERIA = [
  { key: "interviewer", label: "Nom du filtreur", type: "text", placeholder: "Ex: Awa Dione" },
  { key: "comment", label: "Commentaire filtreur", type: "textarea", placeholder: "Synthèse du premier échange..." },
  { key: "anti_cheat_score", label: "Anti-triche validé", type: "checkbox" },
  { key: "logic_score", label: "Logique validée", type: "checkbox" },
  { key: "total_score", label: "Total filtre", type: "computed", system: true, suffix: "/ 2" },
  {
    key: "decision",
    label: "Décision filtreur",
    type: "select",
    options: [
      { value: "validateur", label: "Validateur" },
      { value: "echec", label: "Échec" },
    ],
  },
]

const DWM_VALIDATOR_CRITERIA = [
  { key: "interviewer", label: "Nom du validateur", type: "text", placeholder: "Ex: Karim" },
  { key: "algorithm_logic_score", label: "Algo / Logique validé", type: "checkbox" },
  {
    key: "verdict",
    label: "Verdict",
    type: "select",
    options: [
      { value: "oui", label: "Oui" },
      { value: "non", label: "Non" },
      { value: "reserve", label: "Avec réserve" },
      { value: "a_revoir", label: "À revoir" },
    ],
  },
  {
    key: "comment",
    label: "Commentaire validateur",
    type: "textarea",
    placeholder: "Validation finale, réserves...",
  },
]

const DWM_MOTIVATION_CRITERIA = [
  { key: "interviewer", label: "Nom jury motivation", type: "text", placeholder: "Ex: Mbaye" },
  {
    key: "comment",
    label: "Commentaire motivation",
    type: "textarea",
    placeholder: "Motivation, posture, disponibilité...",
  },
]

const DWM_EXCEL_SCORECARD = {
  filter: {
    title: "Filtreur",
    criteria: DWM_FILTER_CRITERIA,
  },
  validator: {
    title: "Validateur",
    criteria: DWM_VALIDATOR_CRITERIA,
  },
  motivation: {
    title: "Motivation",
    criteria: DWM_MOTIVATION_CRITERIA,
  },
}

const EMPTY_SCORECARD = {
  filter: { title: "Filtreur", criteria: [] },
  validator: { title: "Validateur", criteria: [] },
  motivation: { title: "Motivation", criteria: [] },
}

export const FORMATION_LABELS = {
  "dev-web-mobile": "Développement Web Mobile",
  "dev-data": "Développement Data",
  hackeuses: "Hackeuses",
  "aws-cloud": "AWS Cloud",
  "referent-digital": "Référent Digital",
  "cyber-security": "Cybersécurité",
  "intelligence-artificielle": "Intelligence Artificielle",
}

export const INTERVIEW_SCORECARD_CONFIGS = {
  "dev-web-mobile": {
    formation: "dev-web-mobile",
    formationLabel: FORMATION_LABELS["dev-web-mobile"],
    source: "excel",
    sourceLabel: "Grille alignée sur le fichier Excel de ce référentiel",
    scorecard: DWM_EXCEL_SCORECARD,
  },
  "dev-data": {
    formation: "dev-data",
    formationLabel: FORMATION_LABELS["dev-data"],
    source: "unconfigured",
    sourceLabel: "Aucune grille configurée pour ce référentiel",
    scorecard: EMPTY_SCORECARD,
  },
  hackeuses: {
    formation: "hackeuses",
    formationLabel: FORMATION_LABELS.hackeuses,
    source: "unconfigured",
    sourceLabel: "Aucune grille configurée pour ce référentiel",
    scorecard: EMPTY_SCORECARD,
  },
  "aws-cloud": {
    formation: "aws-cloud",
    formationLabel: FORMATION_LABELS["aws-cloud"],
    source: "unconfigured",
    sourceLabel: "Aucune grille configurée pour ce référentiel",
    scorecard: EMPTY_SCORECARD,
  },
  "referent-digital": {
    formation: "referent-digital",
    formationLabel: FORMATION_LABELS["referent-digital"],
    source: "unconfigured",
    sourceLabel: "Aucune grille configurée pour ce référentiel",
    scorecard: EMPTY_SCORECARD,
  },
  "cyber-security": {
    formation: "cyber-security",
    formationLabel: FORMATION_LABELS["cyber-security"],
    source: "unconfigured",
    sourceLabel: "Aucune grille configurée pour ce référentiel",
    scorecard: EMPTY_SCORECARD,
  },
  "intelligence-artificielle": {
    formation: "intelligence-artificielle",
    formationLabel: FORMATION_LABELS["intelligence-artificielle"],
    source: "unconfigured",
    sourceLabel: "Aucune grille configurée pour ce référentiel",
    scorecard: EMPTY_SCORECARD,
  },
}

export const DEFAULT_INTERVIEW_SCORECARD_CONFIG = {
  formation: "",
  formationLabel: "Référentiel inconnu",
  source: "unconfigured",
  sourceLabel: "Aucune grille configurée pour ce référentiel",
  scorecard: EMPTY_SCORECARD,
}

function normalizeCampaignScorecard(formation, campaignScorecard) {
  if (!campaignScorecard?.sections) {
    return null
  }

  return {
    formation,
    formationLabel: FORMATION_LABELS[formation] || formation || "Référentiel inconnu",
    source: campaignScorecard.source || "custom",
    sourceLabel: campaignScorecard.source_label || "Grille personnalisée",
    scorecard: campaignScorecard.sections,
  }
}

export function getInterviewScorecardConfig(formation, campaignScorecard) {
  return (
    normalizeCampaignScorecard(formation, campaignScorecard)
    || INTERVIEW_SCORECARD_CONFIGS[formation]
    || DEFAULT_INTERVIEW_SCORECARD_CONFIG
  )
}

export function getInterviewScorecard(formation, campaignScorecard) {
  return getInterviewScorecardConfig(formation, campaignScorecard).scorecard
}
