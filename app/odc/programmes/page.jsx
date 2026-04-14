
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, PenTool as Tool, Lightbulb, MapPin, Calendar, ArrowRight, BookOpen } from "lucide-react"
import AnimatedSection from "@/components/AnimatedSection"
import Image from "next/image"

export default function ProgrammesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ff7900] to-[#ff9d4d] py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6 md:mb-8">
            <Button asChild variant="secondary" className="bg-white">
              <Link href="/competences">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold"> Notre chaîne de valeur </h1>
            <p className="mt-4 text-lg md:text-xl">
              Découvrez nos différents programmes d'accompagnement et de formation pour développer les compétences
              numériques au Sénégal.
            </p>
          </div>
        </div>
      </section>

      {/* ODC Clubs Section */}
      <section className="py-8 md:py-10 bg-white dark:bg-gray-800">
        <div className="container bg-gray-100 mx-auto p-4">
          <div className="mx-auto max-w-5xl">
            <AnimatedSection className="mb-8 md:mb-12">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#ff7900] flex items-center justify-center text-white mr-4 flex-shrink-0">
                  <Users size={24} className="md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">ODC Clubs</h2>
              </div>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
                Des communautés d'apprentissage et d'innovation dans les universités sénégalaises.
              </p>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              <AnimatedSection delay={0.2}>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Communautés d'apprentissage dans les universités
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                  Les ODC Clubs sont des communautés d'étudiants passionnés par la technologie, présentes dans plusieurs
                  universités du Sénégal. Ces clubs permettent aux étudiants de développer leurs compétences numériques,
                  de collaborer sur des projets innovants et de se connecter avec l'écosystème tech local.
                </p>

                <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-xl mb-6 md:mb-8 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#ff7900] flex items-center justify-center mr-3 flex-shrink-0">
                      <MapPin className="text-white w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      Universités partenaires
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Université Gaston Berger (UGB)",
                      "Université Amadou Moctar Mbow de Dakar",
                      "Université Alioune Diop de Bambey",
                      "Université Assane Seck de Ziguinchor",
                    ].map((university, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-[#ff7900] font-bold text-sm">•</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{university}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.4} className="flex flex-col h-full">
                <div className="relative w-full">
                  <Image
                    src="/ODCClubs.jpg"
                    alt="Photo des membres des ODC Clubs"
                    width={1400}
                    height={1000}
                    className="object-contain rounded-xl"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* FabLab Section */}
      <section className="py-8 md:py-10 bg-white dark:bg-gray-900">
        <div className="container bg-gray-100 mx-auto p-4">
          <div className="mx-auto max-w-5xl">
            <AnimatedSection className="mb-8 md:mb-12">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#ff7900] flex items-center justify-center text-white mr-4 flex-shrink-0">
                  <Tool size={24} className="md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">FabLab (Lab-S)</h2>
              </div>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
                Un espace d'innovation, de fabrication numérique et de prototypage ouvert à tous.
              </p>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              <div className="flex flex-col">
                <AnimatedSection delay={0.2}>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Lab-S : Un centre d'innovation pour tous
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                    Lab-S est un espace dédié à l'apprentissage et à la création, où nous rendons les nouvelles
                    technologies accessibles à tous. Nous offrons des formations et des ressources pour encourager la
                    créativité et permettre à chacun de concrétiser ses idées en solutions innovantes.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    {[
                      {
                        icon: <Lightbulb className="text-white w-4 h-4 md:w-5 md:h-5" />,
                        title: "Idéation",
                        description: "Développez vos idées innovantes avec le suivi de nos experts.",
                      },
                      {
                        icon: <Tool className="text-white w-4 h-4 md:w-5 md:h-5" />,
                        title: "Prototypage",
                        description: "Créez des prototypes fonctionnels grâce à nos équipements de pointe.",
                      },
                      {
                        icon: <ArrowRight className="text-white w-4 h-4 md:w-5 md:h-5" />,
                        title: "Production",
                        description: "Réalisez vos projets et lancez vos produits sur le marché.",
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-[#ff7900] to-[#e56b00] p-4 md:p-6 rounded-xl text-white h-full"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 md:mb-4">
                          {feature.icon}
                        </div>
                        <h4 className="text-base md:text-lg font-bold mb-2 leading-tight">{feature.title}</h4>
                        <p className="text-white/90 text-sm md:text-base">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={0.4} className="flex flex-col h-full">
                <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Nos équipements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {[
                      "Imprimantes 3D",
                      "Découpeuses laser",
                      "Fraiseuses CNC",
                      "Kits électroniques et robotiques",
                      "Stations de soudure",
                      "Projets Collaboratifs",
                    ].map((equipment, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-[#ff7900] font-bold text-sm">•</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{equipment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white text-black rounded-xl p-6 md:p-8 max-w-md mx-auto shadow-md">
                  <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Accéder au FabLab</h3>
                  <p className="text-gray-700 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
                    Pour réserver une machine, vous inscrire aux formations ou participer à nos événements, veuillez
                    visiter notre plateforme dédiée :
                  </p>
                  <Button asChild className="w-full py-4 md:py-6 bg-black text-white hover:bg-gray-800 text-sm">
                    <a
                      href="https://odcsenegal.fab-manager.com/#!/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      Accéder au portail du FabLab
                      <ArrowRight size={16} className="ml-2" />
                    </a>
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Tech-Ki Section */}
      <section className="py-8 md:py-10 bg-white dark:bg-gray-800">
        <div className="container bg-gray-100 mx-auto p-4">
          <div className="mx-auto max-w-5xl">
            <AnimatedSection className="mb-8 md:mb-12">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#ff7900] flex items-center justify-center text-white mr-4 flex-shrink-0">
                  <Lightbulb size={24} className="md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Acculturation numérique : Tech Ki</h2>
              </div>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
                L'acculturation numérique : Tech-ki propose des formations interactives sur l'inclusion numérique : navigation web, outils
                bureautiques et sécurité en ligne. Elles sont accessibles à tous les niveaux.
              </p>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              <AnimatedSection delay={0.2}>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Présentation du programme
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                  Le programme Tech-Ki a pour but d'acculturer le maximum de personnes aux technologies numériques, en
                  offrant des sessions de formation dynamiques et accessibles. Notre objectif est de démystifier la
                  technologie et de permettre à chacun de développer des compétences numériques essentielles pour
                  réussir dans le monde moderne.
                </p>

                <div className="grid grid-cols-1 mb-2 md:mb-4 md:grid-cols-3 gap-4 md:gap-3">
                  {[
                    {
                      icon: <BookOpen className="text-white w-4 h-4 md:w-5 md:h-5" />,
                      title: "Formation",
                      description: "Modules de formation adaptés aux besoins locaux et aux niveaux des participants.",
                    },
                    {
                      icon: <Lightbulb className="text-white w-4 h-4 md:w-5 md:h-5" />,
                      title: "Sensibilisation",
                      description:
                        "Ateliers de découverte des métiers du numérique et des opportunités professionnelles.",
                    },
                    {
                      icon: <Calendar className="text-sm md:text-base font-bold mb-2 leading-tight" />,
                      title: "Suivi",
                      description:
                        "Programme suivi personnalisé des participants et mise en relation avec l'écosystème entrepreneurial.",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-[#ff7900] to-[#e56b00] p-3 md:p-4 rounded-xl text-white h-full"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 md:mb-4">
                        {feature.icon}
                      </div>
                      <h4
                        className={`text-base md:text-lg font-bold mb-2 leading-tight ${
                          feature.title === "Accompagnement" ? "md:-ml-4" : ""
                        }`}
                      >
                        {feature.title}
                      </h4>
                      <p className="text-white/90 text-sm md:text-base">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="p-4 md:p-4 rounded-xl text-black h-full flex flex-col justify-between">
                  <div className="bg-white p-4 md:p-4 rounded-lg shadow-md ">
                    <h4 className="text-lg md:text-xl font-bold mb-3">Impact du programme</h4>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                      {[
                        { label: "Régions couvertes", value: "14" },
                        { label: "Jeunes formés depuis 2019", value: "50000" },
                        { label: "Partenaires locaux", value: "20+" },
                        { label: "Taux d'insertion", value: "99%" },
                      ].map((item, index) => (
                        <div key={index} className="bg-orange-50 p-3 md:p-4 rounded-lg text-center">
                          <div className="text-2xl md:text-3xl font-bold text-[#ff7900] mb-1">{item.value}</div>
                          <p className="text-black/80 text-xs md:text-sm">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 md:p-4 shadow-md rounded-lg">
                    <h4 className="text-lg md:text-xl font-bold mb-3">
                      Développez vos compétences numériques avec Tech-Ki
                    </h4>
                    <p className="text-black/80 mb-4 md:mb-6 text-sm md:text-base">
                      Rejoignez Tech-Ki pour apprendre à maîtriser les outils numériques, développer votre confiance et
                      transformer durablement votre vie personnelle et professionnelle grâce aux compétences digitales.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
