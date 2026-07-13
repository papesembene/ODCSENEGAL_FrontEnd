"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import useEventsPage from "./hooks/use-events-page"
import {
  AddEventDialog,
  EventDetailsModal,
  EventRegistrationDialog,
  EventsCalendarDialog,
  EventsHero,
  NewsletterSection,
  UpcomingEventsSection,
} from "./events-page-sections"

export default function EvenementsPage() {
  const eventsPage = useEventsPage()

  return (
    <div className="container mx-auto px-4 py-12">
      <EventsHero />

      {eventsPage.error ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <p>{eventsPage.error}</p>
          </div>
        </div>
      ) : null}

      <UpcomingEventsSection
        events={eventsPage.filteredUpcomingEvents}
        selectedCategory={eventsPage.selectedCategory}
        filterOptions={eventsPage.eventFilterOptions}
        showCalendar={eventsPage.showCalendar}
        onToggleCalendar={() => eventsPage.setShowCalendar((prev) => !prev)}
        onSelectCategory={eventsPage.setSelectedCategory}
        onShowAddEvent={() => eventsPage.setShowAddEvent(true)}
        onOpenDetails={eventsPage.setSelectedEvent}
        onOpenRegistration={(event) => {
          eventsPage.setSelectedEvent(event)
          eventsPage.setShowRegistration(true)
        }}
      />

      <AddEventDialog
        open={eventsPage.showAddEvent}
        eventForm={eventsPage.eventForm}
        isSubmitting={eventsPage.isSubmitting}
        onOpenChange={eventsPage.setShowAddEvent}
        onFieldChange={eventsPage.updateEventField}
        onImageChange={eventsPage.setEventImage}
        onRemoveImage={eventsPage.removeEventImage}
        onSubmit={eventsPage.submitEvent}
      />

      <EventsCalendarDialog
        open={eventsPage.showCalendar}
        selectedMonth={eventsPage.selectedMonth}
        selectedYear={eventsPage.selectedYear}
        allEvents={[...eventsPage.upcomingEvents, ...eventsPage.pastEvents]}
        onOpenChange={eventsPage.setShowCalendar}
        onPreviousMonth={() => {
          if (eventsPage.selectedMonth === 0) {
            eventsPage.setSelectedMonth(11)
            eventsPage.setSelectedYear((prev) => prev - 1)
          } else {
            eventsPage.setSelectedMonth((prev) => prev - 1)
          }
        }}
        onNextMonth={() => {
          if (eventsPage.selectedMonth === 11) {
            eventsPage.setSelectedMonth(0)
            eventsPage.setSelectedYear((prev) => prev + 1)
          } else {
            eventsPage.setSelectedMonth((prev) => prev + 1)
          }
        }}
      />

      <NewsletterSection
        email={eventsPage.newsletterEmail}
        success={eventsPage.newsletterSuccess}
        onChange={eventsPage.setNewsletterEmail}
        onSubmit={eventsPage.submitNewsletter}
      />

      <EventDetailsModal
        event={eventsPage.selectedEvent}
        onClose={() => eventsPage.setSelectedEvent(null)}
        onRegister={() => eventsPage.setShowRegistration(true)}
      />

      <EventRegistrationDialog
        open={eventsPage.showRegistration}
        event={eventsPage.selectedEvent}
        formData={eventsPage.registrationForm}
        success={eventsPage.registrationSuccess}
        onOpenChange={eventsPage.setShowRegistration}
        onFieldChange={eventsPage.updateRegistrationField}
        onSubmit={eventsPage.submitRegistration}
      />
    </div>
  )
}
