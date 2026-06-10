import {
  buildInputFormData,
  buildMultipartApplicationFormData,
  buildSelectFormData,
  clearFieldError,
  handlePhoneInput,
  mergeErrors,
  normalizeSharedFieldValue,
} from "./shared-form-utils"

export const processInputValue = ({ name, value, type, checked }) => {
  if (type === "checkbox") {
    return checked
  }

  return normalizeSharedFieldValue(name, value)
}

export const updateFormDataValue = (prev, name, value) => {
  if (name === "region") {
    return buildSelectFormData(prev, name, value)
  }

  return buildInputFormData(prev, { name, type: "text", checked: false, value })
}

export const omitError = clearFieldError

export const buildApplicationFormData = (formData) => {
  return buildMultipartApplicationFormData(formData, { program: "startup_lab" })
}

export { handlePhoneInput, mergeErrors }
