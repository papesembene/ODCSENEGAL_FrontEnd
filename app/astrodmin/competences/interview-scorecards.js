import { DEFAULT_TRAININGS, findTraining } from "../../../lib/training-catalog.js"

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

export const FORMATION_LABELS = Object.fromEntries(DEFAULT_TRAININGS.map((item) => [item.code, item.title]))

export const INTERVIEW_SCORECARD_CONFIGS = Object.fromEntries(DEFAULT_TRAININGS.map((training) => {
  const fromExcel = training.code === "dev-web-mobile"
  return [training.code, {
    formation: training.code,
    formationLabel: training.title,
    source: fromExcel ? "excel" : "unconfigured",
    sourceLabel: fromExcel ? "Grille alignée sur le fichier Excel de ce référentiel" : "Aucune grille configurée pour ce référentiel",
    scorecard: fromExcel ? DWM_EXCEL_SCORECARD : EMPTY_SCORECARD,
  }]
}))

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
    formationLabel: findTraining(formation)?.title || formation || "Référentiel inconnu",
    source: campaignScorecard.source || "custom",
    sourceLabel: campaignScorecard.source_label || "Grille personnalisée",
    scorecard: campaignScorecard.sections,
  }
}

export function getInterviewScorecardConfig(formation, campaignScorecard) {
  const config = normalizeCampaignScorecard(formation, campaignScorecard)
    || INTERVIEW_SCORECARD_CONFIGS[formation] || DEFAULT_INTERVIEW_SCORECARD_CONFIG
  return { ...config, formation, formationLabel: findTraining(formation)?.title || config.formationLabel }
}

export function getInterviewScorecard(formation, campaignScorecard) {
  return getInterviewScorecardConfig(formation, campaignScorecard).scorecard
}
