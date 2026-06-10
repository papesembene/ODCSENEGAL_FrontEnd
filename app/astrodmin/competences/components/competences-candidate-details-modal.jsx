"use client"

import { Download, FileText, Mail, Phone, UserCheck, UserX, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CompetencesCandidateDetailsModal({
  candidate,
  onClose,
  onAccept,
  onReject,
  getStatusColor,
  getStatusLabel,
  getGenderLabel,
}) {
  if (!candidate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Détails du candidat</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">
                    {candidate.first_name?.[0] || "?"}
                    {candidate.last_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">
                    {candidate.first_name} {candidate.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{candidate.desired_training}</p>
                  <Badge variant="outline" className={`${getStatusColor(candidate.status)} mt-2 text-white`}>
                    {getStatusLabel(candidate.status)}
                  </Badge>
                </div>
                <div className="mt-4 w-full space-y-2">
                  <div className="flex w-full space-x-2">
                    <Button variant="default" className="flex-1 bg-green-500 hover:bg-green-600" onClick={onAccept}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Accepter
                    </Button>
                    <Button variant="default" className="flex-1 bg-red-500 hover:bg-red-600" onClick={onReject}>
                      <UserX className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Informations personnelles</h4>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.phone}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Date de naissance</Label>
                            <p className="text-sm">
                              {candidate.date_of_birth ? new Date(candidate.date_of_birth).toLocaleDateString("fr-FR") : "Non renseigné"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Lieu de naissance</Label>
                            <p className="text-sm">{candidate.place_of_birth || "Non renseigné"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Genre</Label>
                            <p className="text-sm">{getGenderLabel(candidate.gender)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Nationalité</Label>
                            <p className="text-sm">{candidate.nationality || "Non renseigné"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">CNI / Passeport</Label>
                            <p className="text-sm">{candidate.cni_or_passport_number || "Non renseigné"}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Région de résidence</Label>
                            <p className="text-sm">{candidate.region_of_residence || "Non renseigné"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Informations académiques et professionnelles</h4>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Structure actuelle</Label>
                            <p className="text-sm">{candidate.current_structure || "Non renseigné"}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Niveau d'études</Label>
                            <p className="text-sm">{candidate.education_level || "Non renseigné"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Spécialité</Label>
                            <p className="text-sm">{candidate.speciality || "Non renseigné"}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">En emploi</Label>
                            <p className="text-sm">{candidate.is_working ? "Oui" : "Non"}</p>
                          </div>
                        </div>
                        {candidate.is_working ? (
                          <div>
                            <Label className="text-xs text-muted-foreground">Type de contrat</Label>
                            <p className="text-sm">{candidate.contract_type || "Non renseigné"}</p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Formation et disponibilité</h4>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Formation souhaitée</Label>
                          <p className="text-sm font-medium">{candidate.desired_training}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Compétences informatiques</Label>
                            <p className="text-sm">{candidate.computer_skills ? "Oui" : "Non"}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Disponible 10 mois</Label>
                            <p className="text-sm">{candidate.available_for_10_months ? "Oui" : "Non"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Conditions acceptées</Label>
                            <div className="text-sm">
                              {candidate.accept_conditions ? (
                                <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">
                                  ✓ Oui
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800">
                                  ✗ Non
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {candidate.cv_file || candidate.motivation_letter ? (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                      <Card>
                        <CardContent className="space-y-3 p-4">
                          {candidate.cv_file ? (
                            <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                              <div className="flex items-center">
                                <FileText className="mr-3 h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium">Curriculum Vitae</p>
                                  <p className="text-xs text-muted-foreground">Document PDF ou Word</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => window.open(candidate.cv_file, "_blank")}>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger
                              </Button>
                            </div>
                          ) : null}
                          {candidate.motivation_letter ? (
                            <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                              <div className="flex items-center">
                                <FileText className="mr-3 h-5 w-5 text-purple-600" />
                                <div>
                                  <p className="text-sm font-medium">Lettre de motivation</p>
                                  <p className="text-xs text-muted-foreground">Document PDF ou Word</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => window.open(candidate.motivation_letter, "_blank")}>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger
                              </Button>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>
                  ) : null}

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Informations de suivi</h4>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Date de création</Label>
                            <p className="text-sm">
                              {candidate.application_date
                                ? new Date(candidate.application_date).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Dernière mise à jour</Label>
                            <p className="text-sm">
                              {candidate.updated_at
                                ? new Date(candidate.updated_at).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        {candidate.application_date || candidate.created_at ? (
                          <div>
                            <Label className="text-xs text-muted-foreground">Date de soumission</Label>
                            <p className="text-sm">
                              {new Date(candidate.application_date || candidate.created_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ) : null}
                        {candidate.interview_date ? (
                          <div>
                            <Label className="text-xs text-muted-foreground">Date d'entretien</Label>
                            <p className="text-sm font-medium text-blue-600">
                              {new Date(candidate.interview_date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ) : null}
                        {candidate.score ? (
                          <div>
                            <Label className="text-xs text-muted-foreground">Score du test</Label>
                            <p className="text-sm font-semibold text-green-600">{candidate.score}</p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </div>

                  {candidate.admin_notes ? (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Notes administratives</h4>
                      <Card>
                        <CardContent className="p-4">
                          <p className="whitespace-pre-wrap text-sm">{candidate.admin_notes}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
