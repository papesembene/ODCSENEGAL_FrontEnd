import { ArrowRight, AlertCircle, FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormCheckingMessage, FormFieldError } from "@/components/ui/form-feedback"
import { FORM_FEEDBACK_MESSAGES } from "@/lib/form-feedback"
import { COUNTRY_CODES, DIPLOMAS, FILE_FORMATS_HELP_TEXT, FILE_INPUT_ACCEPT, REGIONS_DATA, ROLES } from "../../constants"

export default function StartupCandidatureStepOne({
  formData,
  errors,
  emailExists,
  emailCheckLoading,
  phoneExists,
  phoneCheckLoading,
  dragOverCV,
  handleChange,
  handleBlur,
  handleSelectChange,
  handlePhoneInput,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  clearCv,
  onNext,
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Informations personnelles</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.firstName}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.lastName}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">
          Rôle dans la startup <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)} required>
          <SelectTrigger className={errors.role ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez votre rôle" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.role}</AlertDescription>
          </Alert>
        ) : null}

        {formData.role === "Autre" ? (
          <div className="mt-2">
            <Input
              id="otherRole"
              name="otherRole"
              value={formData.otherRole}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Précisez votre rôle"
              required
              className={errors.otherRole ? "border-red-500" : ""}
            />
            {errors.otherRole ? (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.otherRole}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={emailExists || errors.email ? "border-red-500" : ""}
          />
          <FormFieldError message={emailExists ? FORM_FEEDBACK_MESSAGES.duplicateEmail : null} />
          {errors.email && !emailExists ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.email}</AlertDescription>
            </Alert>
          ) : null}
          {emailCheckLoading ? <FormCheckingMessage /> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailAlternate">Email alternatif</Label>
          <Input
            id="emailAlternate"
            name="emailAlternate"
            type="email"
            value={formData.emailAlternate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.emailAlternate ? "border-red-500" : ""}
          />
          {errors.emailAlternate ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.emailAlternate}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Téléphone <span className="text-red-500">*</span>
        </Label>
        <div className="flex">
          <Select value={formData.phoneCountry} onValueChange={(value) => handleSelectChange("phoneCountry", value)}>
            <SelectTrigger className="w-32 rounded-r-none border-r-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handlePhoneInput}
            placeholder="771234567"
            required
            className={`rounded-l-none ${phoneExists || errors.phone ? "border-red-500" : ""}`}
          />
        </div>
        <FormFieldError message={phoneExists ? FORM_FEEDBACK_MESSAGES.duplicatePhone : null} />
        {errors.phone && !phoneExists ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.phone}</AlertDescription>
          </Alert>
        ) : null}
        {phoneCheckLoading ? <FormCheckingMessage /> : null}
        <p className="text-xs text-gray-500">Saisissez uniquement des chiffres</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="region">
            Région <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.region} onValueChange={(value) => handleSelectChange("region", value)} required>
            <SelectTrigger className={errors.region ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez votre région" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(REGIONS_DATA).map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.region}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">
            Département <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
            required
            disabled={!formData.region}
          >
            <SelectTrigger className={errors.department ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez votre département" />
            </SelectTrigger>
            <SelectContent>
              {formData.region
                ? REGIONS_DATA[formData.region]?.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
          {errors.department ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.department}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diploma">
          Diplôme <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.diploma} onValueChange={(value) => handleSelectChange("diploma", value)} required>
          <SelectTrigger className={errors.diploma ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez votre diplôme" />
          </SelectTrigger>
          <SelectContent>
            {DIPLOMAS.map((diploma) => (
              <SelectItem key={diploma.value} value={diploma.value}>
                {diploma.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.diploma ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.diploma}</AlertDescription>
          </Alert>
        ) : null}

        {formData.diploma === "autre" ? (
          <div className="mt-2">
            <Input
              id="otherDiploma"
              name="otherDiploma"
              value={formData.otherDiploma}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Précisez votre diplôme"
              required
              className={errors.otherDiploma ? "border-red-500" : ""}
            />
            {errors.otherDiploma ? (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.otherDiploma}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">Établissement</Label>
        <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cv">
          CV <span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="cv"
              onDragOver={(e) => handleDragOver(e, "cv")}
              onDragLeave={(e) => handleDragLeave(e, "cv")}
              onDrop={(e) => handleDrop(e, "cv")}
              className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                errors.cv ? "border-red-500" : dragOverCV ? "border-orange-500 bg-orange-50" : "border-gray-300"
              } border-dashed rounded-lg cursor-pointer bg-gray-50 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {formData.cv ? (
                  <div className="flex flex-col items-center">
                    <FileText className="mb-2 h-8 w-8 text-green-500" />
                    <p className="px-4 text-center text-sm font-semibold text-green-600">{formData.cv.name}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ({(formData.cv.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearCv()
                      }}
                      className="mt-2 h-8 gap-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className={`mb-3 h-8 w-8 ${dragOverCV ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`} />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{FILE_FORMATS_HELP_TEXT}</p>
                  </>
                )}
              </div>
              <input
                id="cv"
                name="cv"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept={FILE_INPUT_ACCEPT}
                required
              />
            </label>
          </div>
          {errors.cv ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.cv}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onNext} className="bg-orange-500 transition-colors hover:bg-orange-600">
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
