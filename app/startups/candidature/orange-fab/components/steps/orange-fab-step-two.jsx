import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FileUploadField from "../../file-upload-field"

export default function OrangeFabStepTwo({
  formData,
  errors,
  sectors,
  legalForms,
  handleChange,
  handleBlur,
  handleSelectChange,
  handleRadioChange,
  handleFileChange,
  clearPitchDeck,
  onPrevious,
  onNext,
  allowedExtensionsAccept,
  maxFileSizeMb,
}) {
  return (
    <div className="space-y-6">
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
            NINEA ou regie de commerce <span className="text-red-500">*</span>
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
          Secteur d'activite <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.sector} onValueChange={(value) => handleSelectChange("sector", value)} required>
          <SelectTrigger className={errors.sector ? "border-red-500" : ""}>
            <SelectValue placeholder="Selectionnez un secteur" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
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
              placeholder="Precisez le secteur"
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
            Modele d'affaire <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.businessModel}
            onValueChange={(value) => handleSelectChange("businessModel", value)}
            required
          >
            <SelectTrigger className={errors.businessModel ? "border-red-500" : ""}>
              <SelectValue placeholder="Selectionnez un modele" />
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
            Date de creation <span className="text-red-500">*</span>
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
            <SelectValue placeholder="Selectionnez une forme juridique" />
          </SelectTrigger>
          <SelectContent>
            {legalForms.map((form) => (
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
              placeholder="Precisez la forme juridique"
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
            Nombre d'employes <span className="text-red-500">*</span>
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
        <Label htmlFor="address">Adresse du siege social</Label>
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
          Avez-vous leve des fonds <span className="text-red-500">*</span>
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
              Montant leve <span className="text-red-500">*</span>
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
        <Label htmlFor="clients">References clients</Label>
        <Textarea
          id="clients"
          name="clients"
          value={formData.clients}
          onChange={handleChange}
          rows={3}
          placeholder="Citez vos principales references clients"
        />
      </div>

      <FileUploadField
        id="pitchDeck"
        name="pitchDeck"
        label="Document de presentation (pitch deck)"
        required
        file={formData.pitchDeck}
        error={errors.pitchDeck}
        onChange={handleFileChange}
        onClear={clearPitchDeck}
        accept={allowedExtensionsAccept}
        helperText={`Images, Word, PowerPoint, PDF (MAX. ${maxFileSizeMb}MB)`}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Precedent
        </Button>
        <Button type="button" onClick={onNext} className="bg-orange-500 hover:bg-orange-600 transition-colors">
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
