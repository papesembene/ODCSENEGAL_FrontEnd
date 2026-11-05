import { CANDIDATURE_STEPS } from "../form-steps"

export default function CandidatureSection({ id, title, description, icon: Icon, children }) {
  const number = CANDIDATURE_STEPS.findIndex((step) => step.id === id) + 1
  return <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
    <header className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#e66f00]"><Icon className="h-5 w-5" /></span>
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500" role="status">Étape {number} sur {CANDIDATURE_STEPS.length}</p>
        <h2 id={`${id}-title`} tabIndex={-1} className="text-xl font-bold text-gray-900 focus:outline-none">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      </div>
    </header>
    {children}
  </section>
}
