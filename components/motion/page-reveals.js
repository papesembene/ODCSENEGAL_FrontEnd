const TARGETS = "[data-reveal], main h2, main [data-ui-card]"
const EXCLUDED = "form, table, [role=dialog], [data-motion-owned], [data-motion-skip]"

export function observePageReveals(root) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (!root || !window.IntersectionObserver || !root.animate || preference.matches) return

  const seen = new WeakSet()
  const animations = new Set()
  let frame = 0
  let stopped = false

  function animate(element, delay = 0) {
    const home = Boolean(element.closest("[data-home-motion]"))
    const heading = home && element.dataset.reveal === "heading"
    const metric = home && element.dataset.reveal === "statistic"
    const program = home && element.dataset.motionProfile === "program"
    const partner = home && element.dataset.motionProfile === "partner"
    const parts = heading
      ? [...element.querySelectorAll(":scope > :is(p, h2, a, button), :scope > div > :is(p, h2)")]
      : metric ? [...element.querySelectorAll("svg, dt, [data-impact-value]")] : [element]
    for (const [index, part] of parts.entries()) {
      const words = home && part.matches("h2") ? [...part.querySelectorAll("[data-reveal-word]")] : []
      for (const [wordIndex, target] of (words.length ? words : [part]).entries()) {
        const masked = words.length || target.hasAttribute("data-impact-value")
        const frames = program ? [
          { opacity: .3, translate: "0 90px", scale: ".88", rotate: Number(element.style.getPropertyValue("--program-order")) ? "3deg" : "-3deg" },
          { opacity: 1, translate: "0 0", scale: "1", rotate: "0deg" },
        ] : partner ? [
          { opacity: 0, translate: "0 32px", scale: ".84" },
          { opacity: 1, translate: "0 0", scale: "1" },
        ] : [
          { opacity: 0, translate: masked ? "0 110%" : `0 ${home ? 28 : 20}px` },
          { opacity: 1, translate: "0 0" },
        ]
        const animation = target.animate(frames, { duration: home ? 1000 : 560,
          delay: delay + Math.min(index * 100, 250) + Math.min(wordIndex * 48, 288) + Number(element.dataset.revealDelay || 0),
          easing: home ? "cubic-bezier(.22, 1, .36, 1)" : "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" })
        animations.add(animation)
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation))
      }
    }
  }

  const observer = new IntersectionObserver((entries) => {
    let index = 0
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      observer.unobserve(entry.target)
      if (!entry.target.contains(document.activeElement)) {
        const home = entry.target.closest("[data-home-motion]")
        animate(entry.target, Math.min(index++ * (home ? 85 : 45), home ? 255 : 135))
      }
    }
  }, { threshold: 0, rootMargin: "0px 0px -24px 0px" })

  function collect() {
    frame = 0
    if (stopped) return
    for (const element of root.querySelectorAll(TARGETS)) {
      if (seen.has(element)) continue
      seen.add(element)
      if (element.closest(EXCLUDED) || element.parentElement.closest("[data-ui-card], [data-reveal]")) continue
      // Existing Framer Motion sections already own their entrance animation.
      if (element.closest('[style*="opacity"], [style*="transform"]')) continue
      observer.observe(element)
    }
  }

  function stop() {
    stopped = true
    observer.disconnect()
    mutations.disconnect()
    cancelAnimationFrame(frame)
    for (const animation of animations) animation.cancel()
    animations.clear()
  }

  function revealFocusedContent(event) {
    for (const animation of animations) {
      if (animation.effect?.target.contains(event.target)) animation.finish()
    }
  }

  // API-driven cards are discovered once; no scroll handlers or React updates per frame.
  const mutations = new MutationObserver(() => {
    if (!frame && !stopped) frame = requestAnimationFrame(collect)
  })
  mutations.observe(root, { childList: true, subtree: true })
  preference.addEventListener("change", stop)
  root.addEventListener("focusin", revealFocusedContent)
  window.addEventListener("beforeprint", stop)
  collect()
  return () => {
    stop()
    preference.removeEventListener("change", stop)
    root.removeEventListener("focusin", revealFocusedContent)
    window.removeEventListener("beforeprint", stop)
  }
}
