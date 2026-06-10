"use client"

import { useCallback, useEffect, useState } from "react"

export default function useCountrySelector(countryCodes, { onCountrySelect } = {}) {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCountries, setFilteredCountries] = useState(countryCodes)

  useEffect(() => {
    if (searchQuery) {
      const filtered = countryCodes.filter(
        (country) =>
          country.country.toLowerCase().includes(searchQuery.toLowerCase()) || country.code.includes(searchQuery),
      )
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries(countryCodes)
    }
  }, [countryCodes, searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest(".country-selector")) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCountryDropdown])

  const handleCountrySelect = useCallback(
    (country) => {
      setSelectedCountry(country)
      setShowCountryDropdown(false)
      onCountrySelect?.(country)
    },
    [onCountrySelect],
  )

  return {
    selectedCountry,
    showCountryDropdown,
    searchQuery,
    filteredCountries,
    setShowCountryDropdown,
    setSearchQuery,
    handleCountrySelect,
  }
}
