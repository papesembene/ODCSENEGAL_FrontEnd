// app/actualites/page.tsx
import Link from "@/components/ui/interactive-link"
import { Button } from "@/components/ui/button"

const actualites = [
  {
    id: "1",
    title: "Lancement du programme Code4Agriculture",
    slug: "code4agriculture", // Doit correspondre au [slug]
    date: "15 Juin 2023",
    content: "Contenu complet..."
  }
]

export default function ActualitesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Actualités</h1>
      {actualites.map((item) => (
        <div key={item.id} className="mb-8">
          <Link href={`/actualites/${item.slug}`}>
            <h2 className="text-2xl font-semibold hover:underline">{item.title}</h2>
          </Link>
          <p className="text-gray-500">{item.date}</p>
        </div>
      ))}
    </div>
  )
}
