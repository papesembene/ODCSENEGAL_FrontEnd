// app/faq/page.tsx
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const faqs = [
  {
    question: "Comment puis-je bénéficier des formations d'Orange Digital Center ?",
    answer: "Nos formations sont ouvertes à tous les jeunes passionnés par le numérique. Vous pouvez postuler en ligne via notre plateforme en soumettant votre CV et une lettre de motivation. Les sessions sont gratuites et sélectives."
  },
  {
    question: "Quels sont les critères pour intégrer l'incubateur de startups ?",
    answer: "Nous recherchons des projets innovants avec un potentiel de croissance. Les critères incluent : une équipe motivée, un prototype fonctionnel, un marché potentiel identifié et une adéquation avec nos domaines d'expertise."
  },
  {
    question: "Quelle est la durée des programmes d'accompagnement ?",
    answer: "La durée varie selon les programmes : 3 mois pour les bootcamps intensifs, 6 mois pour le programme Startup School et jusqu'à 12 mois pour l'incubation complète avec possibilité d'extension."
  },
  {
    question: "ODC propose-t-il des financements pour les startups ?",
    answer: "Oui, nous offrons plusieurs options : pré-amorçage pour les idées prometteuses, accès à notre réseau d'investisseurs pour les startups matures, et possibilité de bourses pour les projets les plus innovants."
  },
  {
    question: "Comment collaborer avec ODC en tant qu'entreprise partenaire ?",
    answer: "Nous avons plusieurs modes de collaboration : mécénat de compétences, parrainage de programmes, accueil de stagiaires, ou co-développement de solutions innovantes. Contactez notre équipe partenariats pour discuter des opportunités."
  }
]

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            FAQ
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Trouvez rapidement les réponses à vos questions les plus fréquentes
          </p>
        </div>

        {/* Liste des FAQ */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all hover:shadow-lg"
            >
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </h2>
                  <div className="ml-4 shrink-0 text-orange-500 group-open:rotate-90 transition-transform">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-0 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </div>
              </details>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg mb-6">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <Button asChild size="lg">
            <Link href="/contact">
              Contactez notre équipe
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
