import { Check } from "lucide-react"
import { CANDIDATURE_STEPS } from "../form-steps"

export default function CandidatureProgress({ manager }) {
  return <nav aria-label="Étapes de la candidature" className="mb-6">
    <ol className="grid gap-1 sm:gap-4" style={{ gridTemplateColumns: `repeat(${CANDIDATURE_STEPS.length}, minmax(0, 1fr))` }}>{CANDIDATURE_STEPS.map((step, index) => {
      const completed = index < manager.step
      const current = index === manager.step
      const content = <>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${current
          ? "border-[#ff7900] bg-[#ff7900] text-white" : completed ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-400"}`}>
          {completed ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
        </span>
        <span className={`text-[11px] sm:text-sm ${current ? "font-semibold text-gray-900" : completed ? "text-gray-700" : "text-gray-500"}`}>{step.label}</span>
      </>
      return <li key={step.id} aria-current={current ? "step" : undefined}>
        {completed ? <button type="button" disabled={manager.submitting} onClick={() => manager.returnTo(index)}
          aria-label={`Revenir à l'étape ${index + 1} : ${step.label}`}
          className="flex w-full flex-col items-center gap-2 rounded-lg py-1 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#ff7900] disabled:opacity-50">{content}</button>
          : <div className="flex flex-col items-center gap-2 py-1">{content}</div>}
      </li>
    })}</ol>
  </nav>
}
