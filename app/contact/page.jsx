"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
 
export default function ContactPage() {
  
 
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Contactez-nous
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Vous avez des questions ou souhaitez en savoir plus sur nos programmes ? N'hésitez pas à nous contacter.
          </p>
        </div>
 
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Nos coordonnées</CardTitle>
                <CardDescription>Plusieurs façons de nous joindre</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-orange-1" />
                  <div>
                    <h3 className="font-semibold">Adresse</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Orange Digital Center
                      <br />
                      Dakar, Sénégal
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-orange-1" />
                  <div>
                    <h3 className="font-semibold">Téléphone</h3>
                    <p className="text-gray-600 dark:text-gray-300">+221 33 839 21 00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-orange-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">contact@orangedigitalcenter.sn</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-orange-1" />
                  <div>
                    <h3 className="font-semibold">Horaires d'ouverture</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Lundi - jeudi: 8h - 16h 45
                      <br />
                      Vendredi: 8h - 13h 30
                      <br />
                      Samedi: 9h - 13h 30
                      <br />
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 h-80 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.164105182455!2d-17.471586025651295!3d14.703309974555332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec173bf12119a35%3A0xdca5d1b8dbb71e94!2sSonatel%20Acad%C3%A9mie!5e0!3m2!1sen!2ssn!4v1744505012163!5m2!1sen!2ssn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="dark:grayscale-[50%] dark:opacity-90"
                title="Localisation Orange Digital Center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
 
