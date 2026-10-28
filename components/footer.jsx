import Link from "@/components/ui/interactive-link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import {
  footerContactDetails,
  footerNavigationSections,
  footerSocialLinks,
  siteDescription,
} from "@/lib/site-config"

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
  }

  const contactIcons = {
    mapPin: MapPin,
    phone: Phone,
    mail: Mail,
  }

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logoffodc.png"
                alt="Orange Digital Center Logo"
                width={240}
                height={240}
                className="rounded bg-black"
              />
            </Link>
            <p className="mt-4 text-gray-400">{siteDescription}</p>
            <div className="mt-6 flex space-x-4">
              {footerSocialLinks.map((socialLink) => {
                const Icon = socialIcons[socialLink.icon]

                return (
                  <a
                    key={socialLink.label}
                    href={socialLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-orange-500"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{socialLink.label}</span>
                  </a>
                )
              })}
            </div>
          </div>

          {footerNavigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 transition-colors hover:text-orange-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-4 space-y-4">
              {footerContactDetails.map((contact) => {
                const Icon = contactIcons[contact.icon]
                const itemClassName = contact.icon === "mapPin" ? "items-start" : "items-center"

                return (
                  <li key={contact.label} className={`flex min-w-0 gap-3 ${itemClassName}`}>
                    <Icon className="h-5 w-5 shrink-0 text-orange-500" />
                    {contact.href ? (
                      <a href={contact.href} className="min-w-0 break-words text-gray-400 transition-colors hover:text-orange-500">
                        {contact.label}
                      </a>
                    ) : (
                      <span className="min-w-0 break-words text-gray-400">{contact.label}</span>
                    )}
                  </li>
                )
              })}
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
