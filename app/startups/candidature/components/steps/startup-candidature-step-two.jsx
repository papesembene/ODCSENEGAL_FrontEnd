import { AlertCircle, ArrowLeft, ArrowRight, FileIcon as FilePresentation, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FILE_FORMATS_HELP_TEXT, FILE_INPUT_ACCEPT, LEGAL_FORMS, SECTORS } from "../../constants"

export default function StartupCandidatureStepTwo({
  formData,
  errors,
  dragOverPitchDeck,
  handleChange,
  handleBlur,
  handleSelectChange,
  handleRadioChange,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  clearPitchDeck,
  onPrevious,
  onNext,
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Informations sur l'entreprise</h3>

      <div className="space-y-2">
        <Label htmlFor="companyName">
          Nom de l'entreprise <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={errors.companyName ? "border-red-500" : ""}
        />
        {errors.companyName ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.companyName}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ninea">
            NINEA ou régie de commerce <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ninea"
            name="ninea"
            value={formData.ninea}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.ninea ? "border-red-500" : ""}
          />
          {errors.ninea ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.ninea}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">
          Secteur d'activité <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.sector} onValueChange={(value) => handleSelectChange("sector", value)} required>
          <SelectTrigger className={errors.sector ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez un secteur" />
          </SelectTrigger>
          <SelectContent>
            {SECTORS.map((sector) => (
              <SelectItem key={sector.value} value={sector.value}>
                {sector.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sector ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.sector}</AlertDescription>
          </Alert>
        ) : null}

        {formData.sector === "other" ? (
          <div className="mt-2">
            <Input
              id="otherSector"
              name="otherSector"
              value={formData.otherSector}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Précisez le secteur"
              required
              className={errors.otherSector ? "border-red-500" : ""}
            />
            {errors.otherSector ? (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.otherSector}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessModel">
            Modèle d'affaire <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.businessModel} onValueChange={(value) => handleSelectChange("businessModel", value)} required>
            <SelectTrigger className={errors.businessModel ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
              <SelectItem value="B2B2C">B2B2C</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessModel ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.businessModel}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="creationDate">
            Date de création <span className="text-red-500">*</span>
          </Label>
          <Input
            id="creationDate"
            name="creationDate"
            type="date"
            value={formData.creationDate}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.creationDate ? "border-red-500" : ""}
          />
          {errors.creationDate ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.creationDate}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalForm">
          Forme juridique <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.legalForm} onValueChange={(value) => handleSelectChange("legalForm", value)} required>
          <SelectTrigger className={errors.legalForm ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez une forme juridique" />
          </SelectTrigger>
          <SelectContent>
            {LEGAL_FORMS.map((form) => (
              <SelectItem key={form.value} value={form.value}>
                {form.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.legalForm ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.legalForm}</AlertDescription>
          </Alert>
        ) : null}

        {formData.legalForm === "Autre" ? (
          <div className="mt-2">
            <Input
              id="otherLegalForm"
              name="otherLegalForm"
              value={formData.otherLegalForm}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Précisez la forme juridique"
              required
              className={errors.otherLegalForm ? "border-red-500" : ""}
            />
            {errors.otherLegalForm ? (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.otherLegalForm}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="capital">Capital</Label>
          <div className="flex">
            <Input
              id="capital"
              name="capital"
              value={formData.capital}
              onChange={handleChange}
              placeholder="Montant"
              className="rounded-r-none"
            />
            <Select value={formData.capitalCurrency} onValueChange={(value) => handleSelectChange("capitalCurrency", value)}>
              <SelectTrigger className="w-24 rounded-l-none border-l-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F CFA">F CFA</SelectItem>
                <SelectItem value="$">$</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employees">
            Nombre d'employés <span className="text-red-500">*</span>
          </Label>
          <Input
            id="employees"
            name="employees"
            type="number"
            value={formData.employees}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.employees ? "border-red-500" : ""}
          />
          {errors.employees ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.employees}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse du siège social</Label>
        <Input id="address" name="address" value={formData.address} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="revenue">Chiffre d'affaire</Label>
          <div className="flex">
            <Input
              id="revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              placeholder="Montant"
              className="rounded-r-none"
            />
            <Select value={formData.revenueCurrency} onValueChange={(value) => handleSelectChange("revenueCurrency", value)}>
              <SelectTrigger className="w-24 rounded-l-none border-l-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F CFA">F CFA</SelectItem>
                <SelectItem value="$">$</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Avez-vous levé des fonds <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.raisedFunds}
          onValueChange={(value) => handleRadioChange("raisedFunds", value)}
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Oui" id="funds-yes" />
            <Label htmlFor="funds-yes">Oui</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Non" id="funds-no" />
            <Label htmlFor="funds-no">Non</Label>
          </div>
        </RadioGroup>
        {errors.raisedFunds ? (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.raisedFunds}</AlertDescription>
          </Alert>
        ) : null}

        {formData.raisedFunds === "Oui" ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor="raisedAmount">
              Montant levé <span className="text-red-500">*</span>
            </Label>
            <div className="flex">
              <Input
                id="raisedAmount"
                name="raisedAmount"
                value={formData.raisedAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Montant"
                required
                className={`rounded-r-none ${errors.raisedAmount ? "border-red-500" : ""}`}
              />
              <Select value={formData.raisedCurrency} onValueChange={(value) => handleSelectChange("raisedCurrency", value)}>
                <SelectTrigger className="w-24 rounded-l-none border-l-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F CFA">F CFA</SelectItem>
                  <SelectItem value="$">$</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.raisedAmount ? (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.raisedAmount}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clients">Références clients</Label>
        <Textarea
          id="clients"
          name="clients"
          value={formData.clients}
          onChange={handleChange}
          rows={3}
          placeholder="Citez vos principales références clients"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pitchDeck">
          Document de présentation (pitch deck) <span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="pitchDeck"
              onDragOver={(e) => handleDragOver(e, "pitchDeck")}
              onDragLeave={(e) => handleDragLeave(e, "pitchDeck")}
              onDrop={(e) => handleDrop(e, "pitchDeck")}
              className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                errors.pitchDeck ? "border-red-500" : dragOverPitchDeck ? "border-orange-500 bg-orange-50" : "border-gray-300"
              } border-dashed rounded-lg cursor-pointer bg-gray-50 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {formData.pitchDeck ? (
                  <div className="flex flex-col items-center">
                    <FilePresentation className="mb-2 h-8 w-8 text-green-500" />
                    <p className="px-4 text-center text-sm font-semibold text-green-600">{formData.pitchDeck.name}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ({(formData.pitchDeck.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearPitchDeck()
                      }}
                      className="mt-2 h-8 gap-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className={`mb-3 h-8 w-8 ${dragOverPitchDeck ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`} />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{FILE_FORMATS_HELP_TEXT}</p>
                  </>
                )}
              </div>
              <input
                id="pitchDeck"
                name="pitchDeck"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept={FILE_INPUT_ACCEPT}
                required
              />
            </label>
          </div>
          {errors.pitchDeck ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.pitchDeck}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
        </Button>
        <Button type="button" onClick={onNext} className="bg-orange-500 transition-colors hover:bg-orange-600">
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
