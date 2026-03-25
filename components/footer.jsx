import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
 
const Footer = () => {
  const currentYear = new Date().getFullYear()
 
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logoffodc.png?height=884&width=884"
                alt="Orange Digital Center Logo"
                width={240}
                height={240}
                className="rounded bg-black"
              />
              {/* <span className="text-xl font-bold text-orange-500">Orange Digital Center</span> */}
            </Link>
            <p className="mt-4 text-gray-400">
              Le bras armé de l'État dans la mise en œuvre du new deal technologique pour développer l'emploi des jeunes
              et accompagner les startups.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://www.facebook.com/ODCSN/?locale=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-orange-500"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://x.com/ODCSenegal?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-orange-500"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://www.instagram.com/insideodc/?hl=fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-orange-500"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://sn.linkedin.com/company/orange-digital-center-s%C3%A9n%C3%A9gal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-orange-500"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
 
          <div>
            <h3 className="text-lg font-semibold">Nos Espaces</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/competences" className="text-gray-400 transition-colors hover:text-orange-500">
                  Développement des Compétences
                </Link>
              </li>
              <li>
                <Link href="/startups" className="text-gray-400 transition-colors hover:text-orange-500">
                  Accompagnement Startups
                </Link>
              </li>
              {/* <li>
                <Link href="/startup-school" className="text-gray-400 transition-colors hover:text-orange-500">
                  Startup School
                </Link>
              </li> */}
              {/* <li>
                <Link href="/connect" className="text-gray-400 transition-colors hover:text-orange-500">
                  Espace Open Innovation
                </Link>
              </li>  */}
            </ul>
          </div>
 
          <div>
            <h3 className="text-lg font-semibold">Liens Utiles</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 transition-colors hover:text-orange-500">
                  À propos
                </Link>
              </li>
              
              <li>
                <Link href="/faq" className="text-gray-400 transition-colors hover:text-orange-500">
                  FAQ
                </Link>
              </li>
              {/* <li>
                <Link href="/emplois" className="text-gray-400 transition-colors hover:text-orange-500">
                  Offre d'emplois
                </Link>
              </li> */}
            </ul>
          </div>
 
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">Orange Digital Center, Dakar, Sénégal</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">+221 33 839 21 00</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">orangedigitalcenter@orange-sonatel.com</span>
              </li>
            </ul>
          </div>
        </div>
 
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">
            &copy; {currentYear} Orange Digital Center Sénégal. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
 
export default Footer
 
 