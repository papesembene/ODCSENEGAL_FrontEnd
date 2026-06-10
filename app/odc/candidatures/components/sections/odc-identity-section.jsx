import { ChevronDown, Search } from "lucide-react"
import { FormCheckingMessage } from "@/components/ui/form-feedback"
import { FORM_FEEDBACK_MESSAGES } from "@/lib/form-feedback"

export default function OdcIdentitySection({
  formData,
  errors,
  fieldRefs,
  touchedFields,
  checkingEmail,
  checkingIdNumber,
  emailExists,
  idNumberExists,
  showCountryDropdown,
  searchQuery,
  filteredCountries,
  selectedCountry,
  idType,
  nationalitiesByLetter,
  formations,
  regions,
  setShowCountryDropdown,
  setSearchQuery,
  handleCountrySelect,
  handleChange,
  handleBlur,
  setIdType,
  setTouchedFields,
  setErrors,
  validateIdNumber,
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">1. Identité et contact</h2>
        <p className="mt-1 text-sm text-gray-600">Renseignez vos informations personnelles et votre pièce d&apos;identité.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.firstName = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          {!errors.firstName && <p className="mt-1 text-xs text-gray-500"></p>}
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.lastName = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
          {!errors.lastName && <p className="mt-1 text-xs text-gray-500"></p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
            {checkingEmail && <FormCheckingMessage as="span" className="ml-2 text-xs text-gray-500" />}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.email = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          {emailExists && !errors.email && <p className="mt-1 text-xs text-red-500">{FORM_FEEDBACK_MESSAGES.duplicateEmail}</p>}
          {!errors.email && !emailExists && <p className="mt-1 text-xs text-gray-500">Exemple: nom@domaine.com</p>}
        </div>

        <div className="xl:col-span-2">
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Téléphone <span className="text-red-500">*</span>
          </label>

          <div className="country-selector flex">
            <div className="relative w-1/4 md:w-1/5">
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-l-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <span className="flex items-center">
                  <span className="font-medium text-gray-700">{selectedCountry.abbr}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {showCountryDropdown && (
                <div className="absolute z-10 mt-1 max-h-60 w-64 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="border-b p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full rounded-md border py-1 pl-8 pr-2 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <ul>
                    {filteredCountries.map((country, index) => (
                      <li
                        key={index}
                        className="flex cursor-pointer justify-between px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleCountrySelect(country)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2 font-medium">{country.abbr}</span>
                          <span>{country.country}</span>
                        </div>
                        <span className="font-medium text-gray-500">{country.code}</span>
                      </li>
                    ))}
                    {filteredCountries.length === 0 && <li className="px-3 py-2 text-gray-500">Aucun résultat</li>}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center pl-3 text-gray-500">
                {selectedCountry.code}
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                ref={(el) => (fieldRefs.current.phone = el)}
                className={`w-full rounded-r-md border px-4 py-2 pl-16 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={selectedCountry.format}
              />
            </div>
          </div>

          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="birthDate" className="mb-1 block text-sm font-medium text-gray-700">
            Date de naissance <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.birthDate = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.birthDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
        </div>

        <div>
          <label htmlFor="birthPlace" className="mb-1 block text-sm font-medium text-gray-700">
            Lieu de naissance <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="birthPlace"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.birthPlace = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.birthPlace ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.birthPlace && <p className="mt-1 text-xs text-red-500">{errors.birthPlace}</p>}
          {!errors.birthPlace && <p className="mt-1 text-xs text-gray-500"></p>}
        </div>

        <div>
          <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
            Genre <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.gender = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez votre genre</option>
            <option value="male">Masculin</option>
            <option value="female">Feminin</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="idType" className="mb-1 block text-sm font-medium text-gray-700">
            Type de pièce d'identité <span className="text-red-500">*</span>
          </label>
          <select
            id="idType"
            name="idType"
            value={idType}
            onChange={(e) => {
              setIdType(e.target.value)
              setTouchedFields((prev) => ({ ...prev, idType: true }))
              if (touchedFields.idNumber) {
                const error = validateIdNumber(formData.idNumber, idType)
                if (error) {
                  setErrors((prev) => ({ ...prev, idNumber: error }))
                } else {
                  setErrors((prev) => {
                    const nextErrors = { ...prev }
                    delete nextErrors.idType
                    return nextErrors
                  })
                }
              }
            }}
            onBlur={() => setTouchedFields((prev) => ({ ...prev, idType: true }))}
            ref={(el) => (fieldRefs.current.idType = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.idType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez un type</option>
            <option value="cni">CNI Sénégalaise</option>
            <option value="passport">Passeport</option>
          </select>
          {errors.idType && <p className="mt-1 text-xs text-red-500">{errors.idType}</p>}
        </div>

        <div>
          <label htmlFor="idNumber" className="mb-1 block text-sm font-medium text-gray-700">
            {idType === "cni" ? "N° CNI" : idType === "passport" ? "N° Passeport" : "N° CNI/Passeport"}
            <span className="text-red-500">*</span>
            {checkingIdNumber && <FormCheckingMessage as="span" className="ml-2 text-xs text-gray-500" />}
          </label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.idNumber = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.idNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={idType === "cni" ? "13 à 14 caractères alphanumériques" : idType === "passport" ? "8 ou 9 caractères" : ""}
          />
          {errors.idNumber && <p className="mt-1 text-xs text-red-500">{errors.idNumber}</p>}
          {idNumberExists && !errors.idNumber && <p className="mt-1 text-xs text-red-500">{FORM_FEEDBACK_MESSAGES.duplicateIdNumber}</p>}
        </div>

        <div className="relative">
          <label htmlFor="nationality" className="mb-1 block text-sm font-medium text-gray-700">
            Nationalité <span className="text-red-500">*</span>
          </label>
          <select
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.nationality = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.nationality ? "border-red-500" : "border-gray-300"
            }`}
            style={{ direction: "ltr" }}
          >
            <option value="">Sélectionnez votre nationalité</option>
            {Object.keys(nationalitiesByLetter)
              .sort()
              .map((letter) => (
                <optgroup key={letter} label={letter}>
                  {nationalitiesByLetter[letter].map((nationality) => (
                    <option key={nationality} value={nationality}>
                      {nationality}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
          {errors.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}
        </div>

        <div>
          <label htmlFor="region" className="mb-1 block text-sm font-medium text-gray-700">
            Région de résidence <span className="text-red-500">*</span>
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.region = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.region ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez votre région</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.region && <p className="mt-1 text-xs text-red-500">{errors.region}</p>}
        </div>

        <div>
          <label htmlFor="formation" className="mb-1 block text-sm font-medium text-gray-700">
            Formation souhaitée <span className="text-red-500">*</span>
          </label>
          <select
            id="formation"
            name="formation"
            value={formData.formation}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.formation = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.formation ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez une formation</option>
            {formations
              .filter((formation) => !(formation.femaleOnly && formData.gender === "male"))
              .map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.name}
                </option>
              ))}
          </select>
          {errors.formation && <p className="mt-1 text-xs text-red-500">{errors.formation}</p>}
        </div>

        <div>
          <label htmlFor="currentStructure" className="mb-1 block text-sm font-medium text-gray-700">
            Structure actuelle
          </label>
          <select
            id="currentStructure"
            name="currentStructure"
            value={formData.currentStructure}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.currentStructure = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.currentStructure ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez votre structure</option>
            {formData.formation === "hackeuses" ? (
              <>
                <option value="ecole-formation">École de formation</option>
                <option value="lycee">Lycée</option>
                <option value="college">Collège</option>
                <option value="primaire">Primaire</option>
              </>
            ) : formData.formation === "aws-cloud" || formData.formation === "cyber-security" || formData.formation === "intelligence-artificielle" ? (
              <>
                <option value="ecole-formation">École de formation</option>
                <option value="universite">Université</option>
              </>
            ) : (
              <>
                <option value="universite">Université</option>
                <option value="lycee">Lycée</option>
                <option value="ecole-formation">École de formation</option>
              </>
            )}
          </select>
          {errors.currentStructure && <p className="mt-1 text-xs text-red-500">{errors.currentStructure}</p>}
        </div>

        <div>
          <label htmlFor="education" className="mb-1 block text-sm font-medium text-gray-700">
            Niveau d'études <span className="text-red-500">*</span>
          </label>
          <select
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={(el) => (fieldRefs.current.education = el)}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
              errors.education ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez votre niveau</option>
            {formData.formation === "hackeuses" ? (
              <>
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
                <option value="terminale">Terminal</option>
                <option value="licence1">Licence 1</option>
                <option value="licence2">Licence 2</option>
                <option value="licence3">Licence 3</option>
                <option value="master1">Master 1</option>
                <option value="master2">Master 2</option>
                <option value="cm2">CM2</option>
              </>
            ) : formData.formation === "aws-cloud" || formData.formation === "cyber-security" || formData.formation === "intelligence-artificielle" ? (
              <>
                <option value="licence3">Licence 3 ou équivalent</option>
                <option value="master1">Master 1 ou équivalent</option>
                <option value="master2">Master 2 ou équivalent</option>
              </>
            ) : (
              <>
                <option value="terminale">Terminale</option>
                <option value="bts">BTS</option>
                <option value="licence1">Licence 1 ou équivalent</option>
                <option value="licence2">Licence 2 ou équivalent</option>
                <option value="licence3">Licence 3 ou équivalent</option>
                <option value="master1">Master 1 ou équivalent</option>
                <option value="master2">Master 2 ou équivalent</option>
              </>
            )}
          </select>
          {errors.education && <p className="mt-1 text-xs text-red-500">{errors.education}</p>}
        </div>

        <div>
          <label htmlFor="speciality" className="mb-1 block text-sm font-medium text-gray-700">
            Spécialité
          </label>
          <input
            type="text"
            id="speciality"
            name="speciality"
            value={formData.speciality}
            onChange={handleChange}
            placeholder="Faculté, UFR, Série..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7900]"
          />
        </div>
      </div>
    </section>
  )
}
