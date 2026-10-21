"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react"
import { GoogleIcon, LinkedInIcon } from "./register-icons"
import {
  EDUCATION_LEVEL_OPTIONS,
  MATURITY_STAGE_OPTIONS,
  PROFILE_LABELS,
  PROFILE_OPTIONS,
  STEP_DESCRIPTIONS,
  STEP_TITLES,
} from "./register-constants"

function TextField({ id, label, value, onChange, error, required = false, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 focus:outline-hidden focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-[#ff7900] focus:ring-[#ff7900]"
        }`}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}

function TextAreaField({ id, label, value, onChange, error, rows = 3, required = false, placeholder = "" }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 focus:outline-hidden focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-[#ff7900] focus:ring-[#ff7900]"
        }`}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}

function SelectField({ id, label, value, onChange, options, error, required = false, placeholder }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-md border px-3 py-2 focus:outline-hidden focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-[#ff7900] focus:ring-[#ff7900]"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}

function FileUploadField({ label, file, acceptText, accept, onFileChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <label className="flex w-fit cursor-pointer items-center space-x-2 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 hover:bg-gray-200">
        <Upload className="h-5 w-5" />
        <span>Choisir un fichier</span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>
      {file ? (
        <span className="flex items-center text-sm text-gray-600">
          <Check className="mr-1 h-4 w-4 text-green-500" /> {file.name}
        </span>
      ) : null}
      <p className="text-xs text-gray-500">{acceptText}</p>
    </div>
  )
}

function SummaryCard({ title, items }) {
  const visibleItems = items.filter((item) => item.value)
  if (visibleItems.length === 0) {
    return null
  }

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-2 font-medium text-gray-700">{title}</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleItems.map((item) => (
          <div key={item.label} className={item.fullWidth ? "md:col-span-2" : ""}>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`font-medium ${item.accent ? "text-[#ff7900]" : ""}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RegisterStepHeader({ currentStep }) {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-medium ${
                  currentStep === step
                    ? "bg-[#ff7900] text-white"
                    : currentStep > step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700"
                }`}
              >
                {currentStep > step ? <Check className="h-4 w-4" /> : step}
              </div>
              <span className="mt-2 text-xs text-gray-600">
                {step === 1 && "Compte"}
                {step === 2 && "Profil"}
                {step === 3 && "Validation"}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute left-0 top-0 h-1 w-full bg-gray-200"></div>
          <div
            className="absolute left-0 top-0 h-1 bg-[#ff7900] transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{STEP_TITLES[currentStep]}</h2>
        <p className="mt-1 text-gray-600">{STEP_DESCRIPTIONS[currentStep]}</p>
      </div>
    </>
  )
}

export function RegisterFeedback({ error, success }) {
  return (
    <>
      {error ? (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <p>{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-green-700">
          <p>Inscription réussie! Redirection en cours...</p>
        </div>
      ) : null}
    </>
  )
}

export function AccountStep({ formData, errors, onFieldChange, onOAuthRegister, isDisabled }) {
  return (
    <div className="space-y-5">
      <TextField
        id="email"
        type="email"
        label="Email"
        required
        value={formData.email}
        onChange={(value) => onFieldChange("email", value)}
        error={errors.email}
        placeholder="exemple@email.com"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          id="password"
          type="password"
          label="Mot de passe"
          required
          value={formData.password}
          onChange={(value) => onFieldChange("password", value)}
          error={errors.password}
        />
        <TextField
          id="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          required
          value={formData.confirmPassword}
          onChange={(value) => onFieldChange("confirmPassword", value)}
          error={errors.confirmPassword}
        />
      </div>

      <SelectField
        id="profileType"
        label="Type de profil"
        required
        value={formData.profileType}
        onChange={(value) => onFieldChange("profileType", value)}
        options={PROFILE_OPTIONS}
        error={errors.profileType}
        placeholder="Sélectionnez votre profil"
      />

      <div className="flex items-start space-x-2 pt-2">
        <div className="flex h-5 items-center">
          <input
            id="terms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(event) => onFieldChange("acceptTerms", event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#ff7900] focus:ring-[#ff7900]"
          />
        </div>
        <label htmlFor="terms" className="text-sm text-gray-700">
          J&apos;accepte les{" "}
          <Link href="/terms" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline">
            conditions générales
          </Link>{" "}
          et la{" "}
          <Link href="/privacy" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline">
            politique de confidentialité
          </Link>
        </label>
      </div>
      {errors.acceptTerms ? <p className="text-sm text-red-500">{errors.acceptTerms}</p> : null}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Ou s&apos;inscrire avec</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onOAuthRegister("google")}
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          onClick={() => onOAuthRegister("linkedin")}
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <LinkedInIcon />
          LinkedIn
        </button>
      </div>
    </div>
  )
}

export function ProfileStep({ formData, formErrors, onFieldChange, onFileChange }) {
  if (formData.profileType === "student") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Profil Étudiant / Jeune</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            id="institution"
            label="Établissement"
            required
            value={formData.institution}
            onChange={(value) => onFieldChange("institution", value)}
            error={formErrors.institution}
          />
          <SelectField
            id="educationLevel"
            label="Niveau d'études"
            required
            value={formData.educationLevel}
            onChange={(value) => onFieldChange("educationLevel", value)}
            options={EDUCATION_LEVEL_OPTIONS}
            error={formErrors.educationLevel}
            placeholder="Sélectionnez votre niveau"
          />
        </div>

        <TextField
          id="sector"
          label="Secteur d'études"
          required
          value={formData.sector}
          onChange={(value) => onFieldChange("sector", value)}
          error={formErrors.sector}
        />

        <TextAreaField
          id="motivations"
          label="Motivations"
          value={formData.motivations}
          onChange={(value) => onFieldChange("motivations", value)}
          placeholder="Décrivez vos motivations pour rejoindre la plateforme..."
        />

        <TextAreaField
          id="interests"
          label="Centres d'intérêt"
          value={formData.interests}
          onChange={(value) => onFieldChange("interests", value)}
          placeholder="Listez vos centres d'intérêt professionnels..."
        />

        <FileUploadField
          label="CV"
          file={formData.cvFile}
          accept=".pdf,.doc,.docx"
          acceptText="Formats acceptés: PDF, DOC, DOCX. Max 5MB."
          onFileChange={(file) => onFileChange("cvFile", file)}
        />

        <FileUploadField
          label="Lettre de motivation"
          file={formData.coverLetterFile}
          accept=".pdf,.doc,.docx"
          acceptText="Formats acceptés: PDF, DOC, DOCX. Max 5MB."
          onFileChange={(file) => onFileChange("coverLetterFile", file)}
        />
      </div>
    )
  }

  if (formData.profileType === "startup") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Profil Startup / Porteur de projet</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            id="companyName"
            label="Nom de l'entreprise"
            required
            value={formData.companyName}
            onChange={(value) => onFieldChange("companyName", value)}
            error={formErrors.companyName}
          />
          <TextField
            id="companySector"
            label="Secteur d'activité"
            required
            value={formData.companySector}
            onChange={(value) => onFieldChange("companySector", value)}
            error={formErrors.companySector}
          />
        </div>

        <TextField
          id="location"
          label="Localisation"
          required
          value={formData.location}
          onChange={(value) => onFieldChange("location", value)}
          error={formErrors.location}
          placeholder="Ville, Pays"
        />

        <TextAreaField
          id="valueProposition"
          label="Proposition de valeur"
          required
          value={formData.valueProposition}
          onChange={(value) => onFieldChange("valueProposition", value)}
          error={formErrors.valueProposition}
          placeholder="Décrivez brièvement la proposition de valeur de votre startup..."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            id="maturityStage"
            label="Stade de maturité"
            required
            value={formData.maturityStage}
            onChange={(value) => onFieldChange("maturityStage", value)}
            options={MATURITY_STAGE_OPTIONS}
            error={formErrors.maturityStage}
            placeholder="Sélectionnez le stade"
          />
          <TextField
            id="foundingTeam"
            label="Équipe fondatrice"
            value={formData.foundingTeam}
            onChange={(value) => onFieldChange("foundingTeam", value)}
            placeholder="Nombre de fondateurs et rôles"
          />
        </div>

        <TextAreaField
          id="needs"
          label="Besoins exprimés"
          value={formData.needs}
          onChange={(value) => onFieldChange("needs", value)}
          placeholder="RH, financement, partenaires, etc."
        />

        <FileUploadField
          label="Logo"
          file={formData.logo}
          accept=".png,.jpg,.jpeg,.svg"
          acceptText="Formats acceptés: PNG, JPG, SVG. Max 2MB."
          onFileChange={(file) => onFileChange("logo", file)}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FileUploadField
            label="Pitch Deck"
            file={formData.pitchDeckFile}
            accept=".pdf,.ppt,.pptx"
            acceptText="Formats acceptés: PDF, PPT, PPTX. Max 10MB."
            onFileChange={(file) => onFileChange("pitchDeckFile", file)}
          />
          <FileUploadField
            label="Business Plan"
            file={formData.businessPlanFile}
            accept=".pdf,.doc,.docx"
            acceptText="Formats acceptés: PDF, DOC, DOCX. Max 10MB."
            onFileChange={(file) => onFileChange("businessPlanFile", file)}
          />
        </div>
      </div>
    )
  }

  if (formData.profileType === "corporate" || formData.profileType === "investor") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Profil {formData.profileType === "corporate" ? "Corporate" : "Administration"}
        </h3>

        <TextField
          id="organizationName"
          label="Nom de l'organisation"
          required
          value={formData.organizationName}
          onChange={(value) => onFieldChange("organizationName", value)}
          error={formErrors.organizationName}
        />

        <TextAreaField
          id="activities"
          label="Activités"
          required
          value={formData.activities}
          onChange={(value) => onFieldChange("activities", value)}
          error={formErrors.activities}
          placeholder="Décrivez les principales activités de votre organisation..."
        />

        <TextAreaField
          id="interestSectors"
          label="Secteurs d'intérêt"
          required
          value={formData.interestSectors}
          onChange={(value) => onFieldChange("interestSectors", value)}
          error={formErrors.interestSectors}
          placeholder="Listez les secteurs qui vous intéressent..."
        />

        <TextAreaField
          id="cooperationObjectives"
          label="Objectifs de coopération"
          value={formData.cooperationObjectives}
          onChange={(value) => onFieldChange("cooperationObjectives", value)}
          placeholder="Décrivez vos objectifs de coopération avec l'écosystème..."
        />

        <FileUploadField
          label="Plaquette / Documentation"
          file={formData.brochureFile}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          acceptText="Formats acceptés: PDF, DOC, DOCX, PPT, PPTX. Max 10MB."
          onFileChange={(file) => onFileChange("brochureFile", file)}
        />
      </div>
    )
  }

  return (
    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
      Veuillez d&apos;abord sélectionner un type de profil à l&apos;étape 1.
    </div>
  )
}

export function SummaryStep({ formData, summary }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Récapitulatif de votre inscription</h3>

      <SummaryCard title="Informations de base" items={summary.basic} />

      {formData.profileType === "student" ? (
        <SummaryCard title="Profil Étudiant / Jeune" items={summary.student} />
      ) : null}

      {formData.profileType === "startup" ? (
        <SummaryCard title="Profil Startup" items={summary.startup} />
      ) : null}

      {formData.profileType === "corporate" || formData.profileType === "investor" ? (
        <SummaryCard
          title={`Profil ${formData.profileType === "corporate" ? "Corporate" : PROFILE_LABELS[formData.profileType]}`}
          items={summary.partner}
        />
      ) : null}

      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800">
        <p className="text-sm">
          En cliquant sur &quot;Finaliser l&apos;inscription&quot;, vous confirmez que toutes les informations fournies sont
          correctes. Vous recevrez un email de confirmation pour valider votre compte.
        </p>
      </div>
    </div>
  )
}

export function RegisterNavigation({ currentStep, isLoading, authLoading, onPrevious, onNext }) {
  return (
    <div className="mt-8 flex justify-between">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </button>
      ) : (
        <div></div>
      )}

      {currentStep < 3 ? (
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 rounded-md bg-[#ff7900] px-4 py-2 text-white hover:bg-[#ff9a40]"
        >
          Suivant
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md bg-[#ff7900] px-6 py-2 text-white hover:bg-[#ff9a40]"
          disabled={isLoading || authLoading}
        >
          {isLoading || authLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            <>
              Finaliser l'inscription
              <Check className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}
