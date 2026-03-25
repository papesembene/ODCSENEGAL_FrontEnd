"use client"


// components/EventDetails.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";

export const EventDetails = ({ 
  event,
  selectedEvent,
  onClose,
  onRegister,
  showRegisterButton = true
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{event?.title}</DialogTitle>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event?.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{event?.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event?.location}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <div className="relative h-48 w-full">
            <Image
              src={event?.image 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${event.image}`
                : "/placeholder.svg"}
              alt={event?.title || "Event Image"}
              fill
              className="rounded-lg object-cover"
              priority
            />
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-base font-semibold">À propos</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {event?.details || "Aucune description disponible"}
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold">Programme</h3>
              {event?.agenda?.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {(typeof event.agenda === 'string'
                    ? event.agenda.split('\n').filter(Boolean)
                    : event.agenda
                  ).map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {typeof item === 'string' ? item.trim() : JSON.stringify(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucun programme disponible</p>
              )}
            </div>

            {event?.speakers?.length > 0 && (
              <div>
                <h3 className="text-base font-semibold">Intervenants</h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {event.speakers.map((speaker, index) => (
                    <div key={`${speaker.name}-${index}`} className="flex items-center space-x-3">
                      <div className="relative h-10 w-10">
                        <Image
                          src={
                            speaker.image
                              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${speaker.image}`
                              : "/placeholder.svg"
                          }
                          alt={speaker.name || "Intervenant"}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{speaker.name}</p>
                        <p className="text-xs text-gray-500">
                          {speaker.role || "Intervenant"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* nombre inscrits */}
                  {selectedEvent?.registration_count !== undefined && (
                    <p className="text-sm text-gray-500">
                      {selectedEvent.registration_count} personne(s) inscrite(s)
                    </p>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {showRegisterButton && event?.id && (
            <Button onClick={() => {
              onRegister();
              onClose();
            }}>
              S'inscrire
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};