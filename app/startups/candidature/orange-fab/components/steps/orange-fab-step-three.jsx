import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OrangeFabRegulationDialog } from "../../ui-sections"

export default function OrangeFabStepThree({
  formData,
  errors,
  isSubmitting,
  hasReadRegulation,
  isRegulationOpen,
  onRegulationOpenChange,
  onRegulationAccept,
  setAcceptTerms,
  handleChange,
  handleBlur,
  handleRadioChange,
  onPrevious,
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="productName">
          Nom du produit/service <span className="text-red-500">*</span>
        </Label>
        <Input
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={errors.productName ? "border-red-500" : ""}
        />
        {errors.productName ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.productName}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="productDescription">
          Description du produit/service <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="productDescription"
          name="productDescription"
          value={formData.productDescription}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={4}
          required
          className={errors.productDescription ? "border-red-500" : ""}
        />
        {errors.productDescription ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.productDescription}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityDescription">
          Description de l'activite <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="activityDescription"
          name="activityDescription"
          value={formData.activityDescription}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={4}
          required
          className={errors.activityDescription ? "border-red-500" : ""}
        />
        {errors.activityDescription ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.activityDescription}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>
          Avez-vous un produit ou un service fonctionnel ? <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.hasWorkingProduct}
          onValueChange={(value) => handleRadioChange("hasWorkingProduct", value)}
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Oui" id="product-yes" />
            <Label htmlFor="product-yes">Oui</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Non" id="product-no" />
            <Label htmlFor="product-no">Non</Label>
          </div>
        </RadioGroup>
        {errors.hasWorkingProduct ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.hasWorkingProduct}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={setAcceptTerms} required />
        <Label htmlFor="acceptTerms" className="text-sm">
          J'ai lu et accepte le{" "}
          <OrangeFabRegulationDialog
            isOpen={isRegulationOpen}
            onOpenChange={onRegulationOpenChange}
            onAccept={onRegulationAccept}
          />
          . <span className="text-red-500">*</span>
        </Label>
      </div>
      {errors.acceptTerms ? (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.acceptTerms}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Precedent
        </Button>
        <Button type="submit" disabled={isSubmitting || !hasReadRegulation} className="bg-orange-500 hover:bg-orange-600 transition-colors">
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            <>
              Soumettre ma candidature <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
