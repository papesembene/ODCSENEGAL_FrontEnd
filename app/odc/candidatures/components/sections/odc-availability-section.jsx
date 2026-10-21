export default function OdcAvailabilitySection({
  formData,
  errors,
  touchedFields,
  fieldRefs,
  setFormData,
  setErrors,
  setTouchedFields,
  handleChange,
  markFieldAsTouched,
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">2. Disponibilités</h2>
        <p className="mt-1 text-sm text-gray-600">Indiquez votre situation actuelle et votre disponibilité pour la formation.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            As-tu des notions en informatique ? <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="computer_skills"
                checked={formData.computer_skills === true}
                onChange={() => {
                  setFormData({ ...formData, computer_skills: true })
                  setErrors((prev) => ({ ...prev, computer_skills: null }))
                }}
                className="text-[#ff7900] focus:ring-[#ff7900]"
              />
              <span className="ml-2">Oui</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="computer_skills"
                checked={formData.computer_skills === false}
                onChange={() => {
                  setFormData({ ...formData, computer_skills: false })
                  setErrors((prev) => ({ ...prev, computer_skills: null }))
                }}
                className="text-[#ff7900] focus:ring-[#ff7900]"
              />
              <span className="ml-2">Non</span>
            </label>
          </div>
          {errors.computer_skills && <p className="mt-1 text-xs text-red-500">Veuillez sélectionner une réponse.</p>}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700" ref={(el) => (fieldRefs.current.isWorking = el)}>
            Travaillez-vous dans une entreprise actuellement?<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="isWorking"
                checked={formData.isWorking === true}
                onChange={() => {
                  setFormData({ ...formData, isWorking: true })
                  setErrors((prev) => ({ ...prev, isWorking: undefined }))
                }}
                onBlur={() => markFieldAsTouched("isWorking")}
                className="text-[#ff7900] focus:ring-[#ff7900]"
              />
              <span className="ml-2">Oui</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="isWorking"
                checked={formData.isWorking === false}
                onChange={() => {
                  setFormData({ ...formData, isWorking: false })
                  setErrors((prev) => ({ ...prev, isWorking: undefined }))
                }}
                onBlur={() => markFieldAsTouched("isWorking")}
                className="text-[#ff7900] focus:ring-[#ff7900]"
              />
              <span className="ml-2">Non</span>
            </label>
          </div>
          {errors.isWorking && touchedFields.isWorking && <p className="mt-1 text-xs text-red-500">{errors.isWorking}</p>}

          {formData.isWorking && (
            <div className="mt-4">
              <label htmlFor="contractType" className="mb-1 block text-sm font-medium text-gray-700">
                Type de contrat
              </label>
              <select
                id="contractType"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#ff7900]"
              >
                <option value="">Sélectionnez votre type de contrat</option>
                <option value="stage">Stage</option>
                <option value="cdd">CDD</option>
                <option value="cdi">CDI</option>
                <option value="prestataire">Prestataire</option>
                <option value="interim">Intérim</option>
              </select>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700" ref={(el) => (fieldRefs.current.isAvailable = el)}>
            Es-tu disponible pour te concentrer exclusivement à la formation pendant quelques mois ?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="isAvailable"
                checked={formData.isAvailable === true}
                onChange={() => {
                  setFormData({ ...formData, isAvailable: true })
                  setErrors((prev) => {
                    const nextErrors = { ...prev }
                    delete nextErrors.isAvailable
                    return nextErrors
                  })
                  setTouchedFields((prev) => ({ ...prev, isAvailable: true }))
                }}
                className="text-[#ff7900] focus:ring-[#ff7900]"
              />
              <span className="ml-2">Oui</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="isAvailable"
                checked={formData.isAvailable === false}
                onChange={() => {
                  setFormData({ ...formData, isAvailable: false })
                  setErrors((prev) => {
                    const nextErrors = { ...prev }
                    delete nextErrors.isAvailable
                    return nextErrors
                  })
                  setTouchedFields((prev) => ({ ...prev, isAvailable: true }))
                }}
                className="text-[#ff7900] focus:ring-[#ff7900]"
              />
              <span className="ml-2">Non</span>
            </label>
          </div>
          {errors.isAvailable && <p className="mt-1 text-xs text-red-500">{errors.isAvailable}</p>}
        </div>
      </div>
    </section>
  )
}
