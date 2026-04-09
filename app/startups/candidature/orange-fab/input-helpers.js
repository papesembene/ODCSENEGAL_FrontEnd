import {
  buildInputFormData,
  buildMultipartApplicationFormData,
  buildSelectFormData,
  clearFieldError,
  handlePhoneInput,
  normalizeSharedFieldValue,
} from "../shared-form-utils"

export function sanitizeOrangeFabFieldValue(name, value) {
  return normalizeSharedFieldValue(name, value)
}

export function buildApplicationFormData(formData) {
  return buildMultipartApplicationFormData(formData)
}

export { buildInputFormData, buildSelectFormData, clearFieldError, handlePhoneInput }
