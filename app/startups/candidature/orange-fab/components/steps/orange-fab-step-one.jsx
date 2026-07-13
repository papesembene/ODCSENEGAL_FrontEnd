import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormCheckingMessage, FormFieldError } from "@/components/ui/form-feedback"
import { FORM_FEEDBACK_MESSAGES } from "@/lib/form-feedback"
import FileUploadField from "../../file-upload-field"

export default function OrangeFabStepOne({
  formData,
  errors,
  roles,
  countryCodes,
  regionsData,
  diplomas,
  emailExists,
  emailCheckLoading,
  phoneExists,
  phoneCheckLoading,
  handleChange,
  handleBlur,
  handleSelectChange,
  handlePhoneInput,
  handleFileChange,
  clearCv,
  onNext,
  allowedExtensionsAccept,
  maxFileSizeMb,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Prenom <span className="text-red-500">*</span>
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
          Role dans le Startup <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)} required>
          <SelectTrigger className={errors.role ? "border-red-500" : ""}>
            <SelectValue placeholder="Selectionnez votre role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
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
              placeholder="Precisez votre role"
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
          <Label htmlFor="emailAlternate">Email autre contact</Label>
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
          Telephone <span className="text-red-500">*</span>
        </Label>
        <div className="flex">
          <Select value={formData.phoneCountry} onValueChange={(value) => handleSelectChange("phoneCountry", value)}>
            <SelectTrigger className="w-32 rounded-r-none border-r-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((country) => (
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
            Region <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.region} onValueChange={(value) => handleSelectChange("region", value)} required>
            <SelectTrigger className={errors.region ? "border-red-500" : ""}>
              <SelectValue placeholder="Selectionnez votre region" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(regionsData).map((region) => (
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
            Departement <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
            required
            disabled={!formData.region}
          >
            <SelectTrigger className={errors.department ? "border-red-500" : ""}>
              <SelectValue placeholder="Selectionnez votre departement" />
            </SelectTrigger>
            <SelectContent>
              {formData.region
                ? regionsData[formData.region]?.map((department) => (
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
          Diplome <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.diploma} onValueChange={(value) => handleSelectChange("diploma", value)} required>
          <SelectTrigger className={errors.diploma ? "border-red-500" : ""}>
            <SelectValue placeholder="Selectionnez votre diplome" />
          </SelectTrigger>
          <SelectContent>
            {diplomas.map((diploma) => (
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
              placeholder="Precisez votre diplome"
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
        <Label htmlFor="institution">Etablissement</Label>
        <Input
          id="institution"
          name="institution"
          value={formData.institution}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.institution ? "border-red-500" : ""}
        />
        {errors.institution ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.institution}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <FileUploadField
        id="cv"
        name="cv"
        label="CV"
        required
        file={formData.cv}
        error={errors.cv}
        onChange={handleFileChange}
        onClear={clearCv}
        accept={allowedExtensionsAccept}
        helperText={`Images, Word, PowerPoint, PDF (MAX. ${maxFileSizeMb}MB)`}
      />

      <div className="flex justify-end">
        <Button type="button" onClick={onNext} className="bg-orange-500 hover:bg-orange-600 transition-colors">
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
