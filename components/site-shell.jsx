import Header from "@/components/header"
import Footer from "@/components/footer"
import ChatbotWrapper from "@/components/ChatbotWrapper"

export default function SiteShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWrapper />
    </div>
  )
}
