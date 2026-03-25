// app/actualites/[slug]/page.tsx
import { notFound } from "next/navigation"

const actualites = [
  {
    id: "1",
    title: "Lancement du programme Code4Agriculture",
    slug: "code4agriculture", // Doit MATCHER avec l'URL
    date: "15 Juin 2023",
    content: "Contenu détaillé..."
  }
]

export default function Page({ params }: { params: { slug: string } }) {
  const actualite = actualites.find(a => a.slug === params.slug)
  
  if (!actualite) return notFound()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{actualite.title}</h1>
      <p className="text-gray-500 mb-8">{actualite.date}</p>
      <div className="prose max-w-none">
        {actualite.content}
      </div>
    </div>
  )
}