'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, MapPin, DollarSign, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rating } from "@/components/ui/rating";

// Données des investisseurs (à remplacer par une API ou une base de données)
const investisseurs = [
  {
    id: 1,
    nom: "Investisseur 1",
    secteur: "Technologie",
    description: "Investisseur spécialisé dans les startups tech",
    email: "contact@investisseur1.com",
    telephone: "+221 77 123 45 67",
    siteWeb: "www.investisseur1.com",
    montantMin: 50000,
    montantMax: 500000,
    localisation: "Dakar",
    notation: 4.5,
    avis: [
      { id: 1, auteur: "Startup A", note: 5, commentaire: "Excellent investisseur, très réactif" },
      { id: 2, auteur: "Startup B", note: 4, commentaire: "Bon accompagnement" }
    ]
  },
  {
    id: 2,
    nom: "Investisseur 2",
    secteur: "Agriculture",
    description: "Investisseur spécialisé dans l'agro-industrie",
    email: "contact@investisseur2.com",
    telephone: "+221 77 234 56 78",
    siteWeb: "www.investisseur2.com",
    montantMin: 100000,
    montantMax: 1000000,
    localisation: "Thiès",
    notation: 4.2,
    avis: [
      { id: 3, auteur: "Startup C", note: 4, commentaire: "Très professionnel" }
    ]
  },
];

const localisations = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack"];
const montants = [
  { label: "0 - 50 000 €", min: 0, max: 50000 },
  { label: "50 000 - 100 000 €", min: 50000, max: 100000 },
  { label: "100 000 - 500 000 €", min: 100000, max: 500000 },
  { label: "500 000 € et plus", min: 500000, max: Infinity }
];

export default function FinancementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocalisation, setSelectedLocalisation] = useState('');
  const [selectedMontant, setSelectedMontant] = useState('');
  const [filteredInvestisseurs, setFilteredInvestisseurs] = useState(investisseurs);

  const applyFilters = () => {
    let filtered = investisseurs;

    if (searchTerm) {
      filtered = filtered.filter(investisseur => 
        investisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investisseur.secteur.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocalisation) {
      filtered = filtered.filter(investisseur => 
        investisseur.localisation === selectedLocalisation
      );
    }

    if (selectedMontant) {
      const montantRange = montants.find(m => m.label === selectedMontant);
      filtered = filtered.filter(investisseur => 
        investisseur.montantMin >= montantRange.min && 
        investisseur.montantMax <= montantRange.max
      );
    }

    setFilteredInvestisseurs(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedLocalisation, selectedMontant]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLocalisation('');
    setSelectedMontant('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Base de Données des Investisseurs du Sénégal</h1>
      
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 mr-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher un investisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Select value={selectedLocalisation} onValueChange={setSelectedLocalisation}>
              <SelectTrigger>
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                {localisations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMontant} onValueChange={setSelectedMontant}>
              <SelectTrigger>
                <SelectValue placeholder="Montant d'investissement" />
              </SelectTrigger>
              <SelectContent>
                {montants.map((montant) => (
                  <SelectItem key={montant.label} value={montant.label}>{montant.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestisseurs.map((investisseur) => (
          <Card key={investisseur.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{investisseur.nom}</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{investisseur.notation}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Secteur:</span> {investisseur.secteur}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Description:</span> {investisseur.description}
                </p>
                <div className="space-y-2">
                  <p className="text-sm flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {investisseur.localisation}
                  </p>
                  <p className="text-sm flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {investisseur.montantMin.toLocaleString()}€ - {investisseur.montantMax.toLocaleString()}€
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Email:</span> {investisseur.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Téléphone:</span> {investisseur.telephone}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Site Web:</span>{" "}
                    <a href={`https://${investisseur.siteWeb}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {investisseur.siteWeb}
                    </a>
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Avis récents:</h4>
                  {investisseur.avis.slice(0, 2).map((avis) => (
                    <div key={avis.id} className="text-sm">
                      <div className="flex items-center mb-1">
                        <Rating value={avis.note} readOnly />
                        <span className="ml-2 font-semibold">{avis.auteur}</span>
                      </div>
                      <p className="text-gray-600">{avis.commentaire}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
