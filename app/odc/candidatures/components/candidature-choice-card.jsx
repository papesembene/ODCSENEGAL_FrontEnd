import { ArrowUpRight, Check } from "lucide-react"
import styles from "./candidature-choices.module.css"

export default function CandidatureChoiceCard({ manager, name, value, title, children, disabled = false, icon: Icon, index = 0 }) {
  const checked = manager.values[name] === value
  return <label className={`${styles.choice} ${checked ? styles.selected : ""} ${disabled ? styles.unavailable : ""}`}
    style={{ "--choice-delay": `${Math.min(index, 5) * 60}ms` }}>
    <input type="radio" name={name} value={value} checked={checked} disabled={disabled}
      onChange={manager.handleChange} className={styles.choiceControl} aria-invalid={Boolean(manager.errors[name])}
      aria-describedby={manager.errors[name] ? `${name}-error` : undefined} required />
    <span className={styles.choiceTop}><span className={styles.choiceIcon}><Icon aria-hidden="true" size={23} strokeWidth={1.5} /></span>
      <span className={styles.indicator}>{checked ? <Check aria-hidden="true" size={15} /> : <ArrowUpRight aria-hidden="true" size={17} />}</span></span>
    <span className={styles.choiceTitle}>{title}</span>
    <span className={styles.choiceBody}>{children}</span>
  </label>
}
