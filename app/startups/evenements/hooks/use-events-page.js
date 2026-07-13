"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  createEvent,
  getEventCollections,
  registerToEvent,
  subscribeToNewsletter,
} from "@/lib/public-api"
import {
  buildEventPayload,
  EVENT_FILTER_OPTIONS,
  INITIAL_EVENT_FORM,
  INITIAL_REGISTRATION_FORM,
  normalizeEvent,
} from "../events-page-utils"

export default function useEventsPage() {
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [eventForm, setEventForm] = useState(INITIAL_EVENT_FORM)
  const [registrationForm, setRegistrationForm] = useState(INITIAL_REGISTRATION_FORM)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])

  const fetchEvents = useCallback(async () => {
    try {
      setError(null)
      const { upcomingEvents: upcoming, pastEvents: past } = await getEventCollections()
      setUpcomingEvents(upcoming.map(normalizeEvent))
      setPastEvents(past.map(normalizeEvent))
    } catch (fetchError) {
      setError(fetchError.message || "Erreur lors de la récupération des événements")
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredUpcomingEvents = useMemo(
    () => upcomingEvents.filter((event) => selectedCategory === "all" || event.category === selectedCategory),
    [selectedCategory, upcomingEvents],
  )

  const updateEventField = useCallback((field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateRegistrationField = useCallback((field, value) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const setEventImage = useCallback((file) => {
    if (!file) {
      setEventForm((prev) => ({ ...prev, image: null, imagePreview: "" }))
      return
    }

    const preview = URL.createObjectURL(file)
    setEventForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: preview,
    }))
  }, [])

  const removeEventImage = useCallback(() => {
    setEventForm((prev) => ({ ...prev, image: null, imagePreview: "" }))
  }, [])

  const submitEvent = useCallback(
    async (event) => {
      event.preventDefault()
      setIsSubmitting(true)

      try {
        if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location) {
          throw new Error("Veuillez remplir tous les champs obligatoires")
        }

        const response = await createEvent(buildEventPayload(eventForm))
        setUpcomingEvents((prev) => [...prev, normalizeEvent(response.event)])
        setEventForm(INITIAL_EVENT_FORM)
        setShowAddEvent(false)
        toast.success("Événement ajouté avec succès")
      } catch (submitError) {
        toast.error(submitError.message || "Une erreur est survenue")
      } finally {
        setIsSubmitting(false)
      }
    },
    [eventForm],
  )

  const submitRegistration = useCallback(
    async (event) => {
      event.preventDefault()

      try {
        await registerToEvent(selectedEvent.id, registrationForm)
        setRegistrationSuccess(true)
        setRegistrationForm(INITIAL_REGISTRATION_FORM)
        await fetchEvents()

        setTimeout(() => {
          setShowRegistration(false)
          setRegistrationSuccess(false)
          setSelectedEvent(null)
        }, 3000)
      } catch (submitError) {
        toast.error(submitError.message || "Erreur lors de l'inscription")
      }
    },
    [fetchEvents, registrationForm, selectedEvent],
  )

  const submitNewsletter = useCallback(
    async (event) => {
      event.preventDefault()

      try {
        await subscribeToNewsletter(newsletterEmail)
        setNewsletterSuccess(true)
        setNewsletterEmail("")
        setTimeout(() => setNewsletterSuccess(false), 5000)
      } catch (submitError) {
        toast.error(submitError.message || "Erreur lors de l'inscription à la newsletter")
      }
    },
    [newsletterEmail],
  )

  return {
    showAddEvent,
    selectedEvent,
    showRegistration,
    selectedMonth,
    selectedYear,
    showCalendar,
    selectedCategory,
    newsletterEmail,
    newsletterSuccess,
    registrationSuccess,
    isSubmitting,
    error,
    eventForm,
    registrationForm,
    upcomingEvents,
    pastEvents,
    filteredUpcomingEvents,
    eventFilterOptions: EVENT_FILTER_OPTIONS,
    setShowAddEvent,
    setSelectedEvent,
    setShowRegistration,
    setSelectedMonth,
    setSelectedYear,
    setShowCalendar,
    setSelectedCategory,
    setNewsletterEmail,
    updateEventField,
    updateRegistrationField,
    setEventImage,
    removeEventImage,
    submitEvent,
    submitRegistration,
    submitNewsletter,
    fetchEvents,
  }
}
