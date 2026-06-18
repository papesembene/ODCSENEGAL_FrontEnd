export const PROFILE_OPTIONS = [
  { value: "student", label: "Étudiant / Jeune" },
  { value: "startup", label: "Porteur de projet / Startup" },
  { value: "investor", label: "Administration" },
  { value: "corporate", label: "Corporate / entreprise" },
  { value: "other", label: "Autre acteur de l'écosystème" },
]

export const PROFILE_LABELS = {
  student: "Étudiant / Jeune",
  startup: "Porteur de projet / Startup",
  investor: "Investisseur",
  corporate: "Corporate",
  other: "Autre acteur de l'écosystème",
}

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "bac", label: "Bac" },
  { value: "bac+1", label: "Bac+1" },
  { value: "bac+2", label: "Bac+2" },
  { value: "bac+3", label: "Bac+3" },
  { value: "bac+4", label: "Bac+4" },
  { value: "bac+5", label: "Bac+5" },
  { value: "doctorat", label: "Doctorat" },
]

export const MATURITY_STAGE_OPTIONS = [
  { value: "idée", label: "Idée" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "commercialisation", label: "Commercialisation" },
  { value: "croissance", label: "Croissance" },
  { value: "scale-up", label: "Scale-up" },
]

export const STEP_TITLES = {
  1: "Créez votre compte",
  2: "Complétez votre profil",
  3: "Vérifiez vos informations",
}

export const STEP_DESCRIPTIONS = {
  1: "Renseignez vos informations de base",
  2: "Ajoutez des informations spécifiques à votre profil",
  3: "Vérifiez et confirmez vos informations",
}

export const INITIAL_REGISTER_FORM = {
  email: "",
  password: "",
  confirmPassword: "",
  profileType: "",
  acceptTerms: false,
  institution: "",
  educationLevel: "",
  sector: "",
  motivations: "",
  interests: "",
  cvFile: null,
  coverLetterFile: null,
  companyName: "",
  logo: null,
  companySector: "",
  location: "",
  valueProposition: "",
  maturityStage: "",
  foundingTeam: "",
  pitchDeckFile: null,
  businessPlanFile: null,
  needs: "",
  organizationName: "",
  activities: "",
  interestSectors: "",
  cooperationObjectives: "",
  brochureFile: null,
}
