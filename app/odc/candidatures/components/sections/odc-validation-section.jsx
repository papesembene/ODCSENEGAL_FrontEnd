import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormSubmissionError } from "@/components/ui/form-feedback"

export default function OdcValidationSection({
  errors,
  fieldRefs,
  formData,
  touchedFields,
  submitError,
  isSubmitting,
  handleChange,
  setTouchedFields,
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">3. Validation</h2>
        <p className="mt-1 text-sm text-gray-600">Vérifiez les informations saisies avant d&apos;envoyer votre candidature.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
        <label className="flex items-start" ref={(el) => (fieldRefs.current.acceptTerms = el)}>
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            onBlur={() => setTouchedFields((prev) => ({ ...prev, acceptTerms: true }))}
            className={`mr-2 mt-1 ${errors.acceptTerms ? "border-red-500" : ""}`}
          />
          <span className="text-sm text-gray-700">
            <span className="text-red-500">*</span>J'accepte que mes données personnelles soient traitées conformément à la politique
            de confidentialité.
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-1 text-xs text-red-500">{errors.acceptTerms}</p>}
      </div>

      <FormSubmissionError message={submitError} />

      <div className="flex justify-end">
        <Button
          type="submit"
          className="flex w-full items-center justify-center bg-[#ff7900] hover:bg-[#e66f00] md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              Envoyer ma candidature <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </section>
  )
}
