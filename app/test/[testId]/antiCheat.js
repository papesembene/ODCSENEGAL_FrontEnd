"use client"

// /**
//  * Service anti-triche pour les tests en ligne
//  * Détecte et enregistre les activités suspectes
//  */

// export class AntiCheatService {
//   constructor(testId, candidateEmail, onViolation) {
//     this.testId = testId
//     this.candidateEmail = candidateEmail
//     this.onViolation = onViolation || (() => {})
//     this.violations = []
//     this.tabSwitchCount = 0
//     this.blurCount = 0
//     this.copyAttempts = 0
//     this.pasteAttempts = 0
//     this.rightClickAttempts = 0
//     this.devToolsAttempts = 0
//     this.startTime = Date.now()
//     this.isActive = false
//   }

//   start() {
//     if (this.isActive) return
//     this.isActive = true
//     this.startTime = Date.now()
//     this.setupEventListeners()
//     this.detectMultipleTabs()
//   }

//   stop() {
//     this.isActive = false
//     this.removeEventListeners()
//   }

//   setupEventListeners() {
//     // Détection de copier
//     document.addEventListener('copy', this.handleCopy.bind(this), true)
//     document.addEventListener('cut', this.handleCopy.bind(this), true)
    
//     // Détection de coller
//     document.addEventListener('paste', this.handlePaste.bind(this), true)
    
//     // Désactiver le clic droit
//     document.addEventListener('contextmenu', this.handleRightClick.bind(this), true)
    
//     // Détection de perte de focus
//     window.addEventListener('blur', this.handleBlur.bind(this))
//     window.addEventListener('focus', this.handleFocus.bind(this))
    
//     // Détection de changement d'onglet
//     document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
//     // Détection des raccourcis clavier suspects
//     document.addEventListener('keydown', this.handleKeyDown.bind(this), true)
    
//     // Détection de F12 et autres raccourcis développeur
//     document.addEventListener('keydown', this.handleDevTools.bind(this), true)
    
//     // Détection de la capture d'écran (limité mais possible)
//     this.detectScreenshot()
//   }

//   removeEventListeners() {
//     document.removeEventListener('copy', this.handleCopy.bind(this), true)
//     document.removeEventListener('cut', this.handleCopy.bind(this), true)
//     document.removeEventListener('paste', this.handlePaste.bind(this), true)
//     document.removeEventListener('contextmenu', this.handleRightClick.bind(this), true)
//     window.removeEventListener('blur', this.handleBlur.bind(this))
//     window.removeEventListener('focus', this.handleFocus.bind(this))
//     document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
//     document.removeEventListener('keydown', this.handleKeyDown.bind(this), true)
//     document.removeEventListener('keydown', this.handleDevTools.bind(this), true)
//   }

//   handleCopy(event) {
//     if (!this.isActive) return
//     this.copyAttempts++
//     this.recordViolation('copy', 'Tentative de copie détectée')
//     event.preventDefault()
//     event.stopPropagation()
//     return false
//   }

//   handlePaste(event) {
//     if (!this.isActive) return
//     this.pasteAttempts++
//     this.recordViolation('paste', 'Tentative de collage détectée')
//     event.preventDefault()
//     event.stopPropagation()
//     return false
//   }

//   handleRightClick(event) {
//     if (!this.isActive) return
//     this.rightClickAttempts++
//     this.recordViolation('right_click', 'Clic droit détecté')
//     event.preventDefault()
//     event.stopPropagation()
//     return false
//   }

//   handleBlur(event) {
//     if (!this.isActive) return
//     this.blurCount++
//     this.recordViolation('blur', `Perte de focus (${this.blurCount} fois)`)
//   }

//   handleFocus(event) {
//     if (!this.isActive) return
//     // Optionnel : enregistrer le retour de focus
//   }

//   handleVisibilityChange(event) {
//     if (!this.isActive) return
//     if (document.hidden) {
//       this.tabSwitchCount++
//       this.recordViolation('tab_switch', `Changement d'onglet détecté (${this.tabSwitchCount} fois)`)
//     }
//   }

//   handleKeyDown(event) {
//     if (!this.isActive) return
    
//     // Détecter Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
//     if (event.ctrlKey || event.metaKey) {
//       const key = event.key.toLowerCase()
//       if (['c', 'v', 'a', 'x'].includes(key)) {
//         this.recordViolation('keyboard_shortcut', `Raccourci clavier détecté: Ctrl+${key.toUpperCase()}`)
//         event.preventDefault()
//         event.stopPropagation()
//         return false
//       }
//     }
    
//     // Détecter Print Screen
//     if (event.key === 'PrintScreen' || event.keyCode === 44) {
//       this.recordViolation('screenshot', 'Tentative de capture d\'écran détectée')
//       event.preventDefault()
//       return false
//     }
//   }

//   handleDevTools(event) {
//     if (!this.isActive) return
    
//     // Détecter F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
//     if (
//       event.key === 'F12' ||
//       (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(event.key.toLowerCase())) ||
//       (event.ctrlKey && event.key.toLowerCase() === 'u')
//     ) {
//       this.devToolsAttempts++
//       this.recordViolation('devtools', `Tentative d'ouverture des outils développeur (${this.devToolsAttempts} fois)`)
//       event.preventDefault()
//       event.stopPropagation()
//       return false
//     }
//   }

//   detectScreenshot() {
//     // Détection basique de capture d'écran
//     // Note: La détection complète est difficile côté client
//     // Cette méthode détecte les tentatives via raccourcis clavier
//   }

//   detectMultipleTabs() {
//     // Utiliser localStorage pour détecter plusieurs onglets
//     const storageKey = `test_active_${this.testId}`
//     const sessionId = `${Date.now()}_${Math.random()}`
    
//     const checkTabs = () => {
//       if (!this.isActive) return
      
//       const activeSession = localStorage.getItem(storageKey)
//       if (activeSession && activeSession !== sessionId) {
//         this.recordViolation('multiple_tabs', 'Plusieurs onglets du test détectés')
//       }
//       localStorage.setItem(storageKey, sessionId)
//       localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString())
//     }
    
//     checkTabs()
//     this.tabCheckInterval = setInterval(checkTabs, 2000) // Vérifier toutes les 2 secondes
//   }

//   recordViolation(type, message) {
//     const violation = {
//       type,
//       message,
//       timestamp: new Date().toISOString(),
//       testId: this.testId,
//       candidateEmail: this.candidateEmail,
//       elapsedTime: Date.now() - this.startTime
//     }
    
//     this.violations.push(violation)
    
//     // Appeler le callback si fourni
//     if (this.onViolation) {
//       this.onViolation(violation)
//     }
    
//     // Envoyer au backend (optionnel, peut être fait en batch)
//     this.sendViolationToBackend(violation)
//   }

//   async sendViolationToBackend(violation) {
//     try {
//       const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
//       await fetch(`${API_BASE_URL}/api/admin/tests/${this.testId}/log-violation`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(violation)
//       })
//     } catch (error) {
//       console.error('Erreur lors de l\'envoi de la violation:', error)
//     }
//   }

//   getViolationsSummary() {
//     return {
//       total: this.violations.length,
//       tabSwitchCount: this.tabSwitchCount,
//       blurCount: this.blurCount,
//       copyAttempts: this.copyAttempts,
//       pasteAttempts: this.pasteAttempts,
//       rightClickAttempts: this.rightClickAttempts,
//       devToolsAttempts: this.devToolsAttempts,
//       violations: this.violations
//     }
//   }

//   cleanup() {
//     this.stop()
//     if (this.tabCheckInterval) {
//       clearInterval(this.tabCheckInterval)
//     }
//     const storageKey = `test_active_${this.testId}`
//     localStorage.removeItem(storageKey)
//     localStorage.removeItem(`${storageKey}_timestamp`)
//   }
// }

// /**
//  * Service anti-triche pour les tests en ligne
//  * Détecte et enregistre les activités suspectes
//  * Inclut alertes audio et protection contre capture d'écran
//  */

// /**
//  * Service anti-triche pour les tests en ligne
//  * Détecte et enregistre les activités suspectes
//  * Inclut alertes audio et protection contre capture d'écran
//  */
/**
 * Service anti-triche pour les tests en ligne
 * Persiste l'état même après refresh/reload
 * Détecte et enregistre les activités suspectes
 */
/**
 * Service anti-triche pour les tests en ligne
 * Persiste l'état même après refresh/reload
 * Détecte et enregistre les activités suspectes
 */
/**
 * Service anti-triche pour les tests en ligne
 * Persiste l'état même après refresh/reload
 * Détecte et enregistre les activités suspectes
 */
/**
 * Service anti-triche pour les tests en ligne
 * Persiste l'état même après refresh/reload
 * Détecte et enregistre les activités suspectes
 */
/**
 * Service anti-triche pour les tests en ligne
 * Persiste l'état même après refresh/reload
 * Détecte et enregistre les activités suspectes
 */
/**
 * Service anti-triche pour les tests en ligne
 * Persiste l'état même après refresh/reload
 * Détecte et enregistre les activités suspectes
 */
export class AntiCheatService {
  constructor(testId, candidateEmail, onViolation) {
    this.testId = testId
    this.candidateEmail = candidateEmail
    this.onViolation = onViolation || (() => {})

    const sessionKey = `session_id_${testId}`
    this.sessionId = sessionStorage.getItem(sessionKey) || `${Date.now()}_${Math.random()}`
    sessionStorage.setItem(sessionKey, this.sessionId)

    this.violations = []
    this.reloadAttempts = 0
    this.tabSwitchCount = 0
    this.blurCount = 0
    this.copyAttempts = 0
    this.pasteAttempts = 0
    this.rightClickAttempts = 0
    this.devToolsAttempts = 0
    this.startTime = Date.now()
    this.isActive = false
    this.audioContext = null
    this.lastAudioTime = 0
    this.audioDebounceMs = 500
    this.screenProtectionEnabled = false
    this.persistenceInterval = null
    this.tabCheckInterval = null

    this.restorePersistentState()
  }

  persistState() {
    const stateKey = `anti_cheat_state_${this.testId}`
    const state = {
      sessionId: this.sessionId,
      violations: this.violations,
      reloadAttempts: this.reloadAttempts,
      tabSwitchCount: this.tabSwitchCount,
      blurCount: this.blurCount,
      copyAttempts: this.copyAttempts,
      pasteAttempts: this.pasteAttempts,
      rightClickAttempts: this.rightClickAttempts,
      devToolsAttempts: this.devToolsAttempts,
      startTime: this.startTime,
    }
    sessionStorage.setItem(stateKey, JSON.stringify(state))
  }

  restorePersistentState() {
    const stateKey = `anti_cheat_state_${this.testId}`
    const savedState = sessionStorage.getItem(stateKey)

    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        // Restaurer les violations (s'assurer que c'est un tableau)
        this.violations = Array.isArray(state.violations) ? state.violations : []
        // Restaurer les compteurs (s'assurer que ce sont des nombres)
        this.reloadAttempts = Number(state.reloadAttempts) || 0
        this.tabSwitchCount = Number(state.tabSwitchCount) || 0
        this.blurCount = Number(state.blurCount) || 0
        this.copyAttempts = Number(state.copyAttempts) || 0
        this.pasteAttempts = Number(state.pasteAttempts) || 0
        this.rightClickAttempts = Number(state.rightClickAttempts) || 0
        this.devToolsAttempts = Number(state.devToolsAttempts) || 0
        this.startTime = Number(state.startTime) || Date.now()
        this.sessionId = state.sessionId || this.sessionId
        
        // Log pour confirmer la restauration
        if (this.violations.length > 0) {
          console.log(`[AntiCheat] État restauré: ${this.violations.length} violation(s) trouvée(s)`, {
            violations: this.violations.length,
            copyAttempts: this.copyAttempts,
            pasteAttempts: this.pasteAttempts,
            tabSwitchCount: this.tabSwitchCount,
            blurCount: this.blurCount,
            devToolsAttempts: this.devToolsAttempts,
            rightClickAttempts: this.rightClickAttempts,
            reloadAttempts: this.reloadAttempts
          })
        }
      } catch (error) {
        console.error("Erreur lors de la restauration de l'état:", error)
      }
    }
  }

  start() {
    if (this.isActive) return

    this.detectReload()

    this.isActive = true
    this.initializeAudioContext()

    this.setupEventListeners()
    this.detectMultipleTabs()
    this.enableScreenshotProtection()

    this.persistenceInterval = setInterval(() => {
      this.persistState()
    }, 5000)

    this.persistState()
  }

  stop() {
    this.isActive = false
    this.removeEventListeners()
    this.disableScreenshotProtection()

    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval)
    }

    this.persistState()
  }

  detectReload() {
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
      this.reloadAttempts++
      this.recordViolation("reload", `Rechargement de la page détecté (${this.reloadAttempts} fois)`)
      setTimeout(() => {
        this.playAlertSound(900, 350)
      }, 500)
    }
  }

  initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
    } catch (error) {
      console.error("Audio Context not supported:", error)
    }
  }

  playAlertSound(frequency = 800, duration = 300) {
    const now = Date.now()
    if (now - this.lastAudioTime < this.audioDebounceMs) {
      return
    }
    this.lastAudioTime = now

    if (!this.audioContext) return

    try {
      const ctx = this.audioContext
      const oscillator1 = ctx.createOscillator()
      const oscillator2 = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const lfo = ctx.createOscillator()

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      lfo.connect(oscillator1.frequency)
      gainNode.connect(ctx.destination)

      oscillator1.frequency.value = frequency
      oscillator1.type = "square"
      oscillator2.frequency.value = frequency * 1.5
      oscillator2.type = "sawtooth"

      lfo.frequency.value = 6
      lfo.type = "sine"

      const lfoGain = ctx.createGain()
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator1.frequency)
      lfoGain.gain.value = frequency * 0.3

      const durationSec = duration / 1000
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + durationSec * 0.9)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationSec)

      oscillator1.start(ctx.currentTime)
      oscillator2.start(ctx.currentTime)
      lfo.start(ctx.currentTime)

      oscillator1.stop(ctx.currentTime + durationSec)
      oscillator2.stop(ctx.currentTime + durationSec)
      lfo.stop(ctx.currentTime + durationSec)
    } catch (error) {
      console.error("Error playing alert sound:", error)
    }
  }

  enableScreenshotProtection() {
    this.screenProtectionEnabled = true
    const overlay = document.createElement("div")
    overlay.id = "screenshot-protection-overlay"
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.width = "100%"
    overlay.style.height = "100%"
    overlay.style.zIndex = "-9999"
    overlay.style.pointerEvents = "none"
    overlay.setAttribute("data-test-protected", "true")
    document.body.appendChild(overlay)

    this.setupScreenshotPrevention()
  }

  disableScreenshotProtection() {
    this.screenProtectionEnabled = false
    const overlay = document.getElementById("screenshot-protection-overlay")
    if (overlay) {
      overlay.remove()
    }
  }

  setupScreenshotPrevention() {
    document.addEventListener(
      "keydown",
      (e) => {
        if (!this.isActive) return

        if (e.keyCode === 44 || (e.shiftKey && e.keyCode === 44)) {
          e.preventDefault()
          e.stopImmediatePropagation()
          this.recordViolation("screenshot_attempt_printscreen", "Tentative de capture d'écran via Print Screen")
          this.playAlertSound(1000, 400)
          return false
        }

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
          e.preventDefault()
          e.stopImmediatePropagation()
          this.recordViolation("screenshot_attempt_shortcut", "Tentative de capture d'écran via Ctrl+Shift+S")
          this.playAlertSound(1000, 400)
          return false
        }
      },
      true,
    )

    document.addEventListener(
      "contextmenu",
      (e) => {
        if (!this.isActive) return
        e.preventDefault()
        return false
      },
      true,
    )

    if (window.HTMLCanvasElement) {
      const originalToBlob = HTMLCanvasElement.prototype.toBlob
      HTMLCanvasElement.prototype.toBlob = function (...args) {
        this.recordViolation("canvas_export_attempt", "Tentative d'export canvas détectée")
        this.playAlertSound(900, 350)
        return originalToBlob.apply(this, args)
      }.bind(this)
    }
  }

  setupEventListeners() {
    document.addEventListener("copy", this.handleCopy.bind(this), true)
    document.addEventListener("cut", this.handleCopy.bind(this), true)
    document.addEventListener("paste", this.handlePaste.bind(this), true)
    document.addEventListener("contextmenu", this.handleRightClick.bind(this), true)
    window.addEventListener("blur", this.handleBlur.bind(this))
    window.addEventListener("focus", this.handleFocus.bind(this))
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this))
    document.addEventListener("keydown", this.handleKeyDown.bind(this), true)
    document.addEventListener("keydown", this.handleDevTools.bind(this), true)

    window.addEventListener("beforeunload", () => this.persistState())
  }

  removeEventListeners() {
    document.removeEventListener("copy", this.handleCopy.bind(this), true)
    document.removeEventListener("cut", this.handleCopy.bind(this), true)
    document.removeEventListener("paste", this.handlePaste.bind(this), true)
    document.removeEventListener("contextmenu", this.handleRightClick.bind(this), true)
    window.removeEventListener("blur", this.handleBlur.bind(this))
    window.removeEventListener("focus", this.handleFocus.bind(this))
    document.removeEventListener("visibilitychange", this.handleVisibilityChange.bind(this))
    document.removeEventListener("keydown", this.handleKeyDown.bind(this), true)
    document.removeEventListener("keydown", this.handleDevTools.bind(this), true)
    window.removeEventListener("beforeunload", () => this.persistState())
  }

  handleCopy(event) {
    if (!this.isActive) return
    this.copyAttempts++
    this.recordViolation("copy", `Tentative de copie détectée (${this.copyAttempts} fois)`)
    this.playAlertSound(600, 250)
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  handlePaste(event) {
    if (!this.isActive) return
    this.pasteAttempts++
    this.recordViolation("paste", `Tentative de collage détectée (${this.pasteAttempts} fois)`)
    this.playAlertSound(600, 250)
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  handleRightClick(event) {
    if (!this.isActive) return
    this.rightClickAttempts++
    this.recordViolation("right_click", `Clic droit détecté (${this.rightClickAttempts} fois)`)
    this.playAlertSound(700, 250)
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  handleBlur(event) {
    if (!this.isActive) return
    this.blurCount++
    this.recordViolation("blur", `Perte de focus (${this.blurCount} fois)`)
    this.playAlertSound(950, 300)
  }

  handleFocus(event) {
    if (!this.isActive) return
  }

  handleVisibilityChange(event) {
    if (!this.isActive) return
    if (document.hidden) {
      this.tabSwitchCount++
      this.recordViolation("tab_switch", `Changement d'onglet détecté (${this.tabSwitchCount} fois)`)
      this.playAlertSound(1050, 400)
    }
  }

  handleKeyDown(event) {
    if (!this.isActive) return

    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase()
      if (["c", "v", "a", "x"].includes(key)) {
        this.recordViolation("keyboard_shortcut", `Raccourci clavier détecté: Ctrl+${key.toUpperCase()}`)
        this.playAlertSound(700, 250)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    if (event.key === "PrintScreen" || event.keyCode === 44) {
      this.recordViolation("screenshot", "Tentative de capture d'écran détectée")
      this.playAlertSound(1000, 400)
      event.preventDefault()
      return false
    }
  }

  handleDevTools(event) {
    if (!this.isActive) return

    if (
      event.key === "F12" ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(event.key.toLowerCase())) ||
      (event.ctrlKey && event.key.toLowerCase() === "u")
    ) {
      this.devToolsAttempts++
      this.recordViolation("devtools", `Tentative d'ouverture des outils développeur (${this.devToolsAttempts} fois)`)
      this.playAlertSound(800, 350)
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  detectScreenshot() {}

  detectMultipleTabs() {
    const storageKey = `test_active_${this.testId}`
    const sessionId = `${Date.now()}_${Math.random()}`

    const checkTabs = () => {
      if (!this.isActive) return

      const activeSession = localStorage.getItem(storageKey)
      if (activeSession && activeSession !== sessionId) {
        this.recordViolation("multiple_tabs", "Plusieurs onglets du test détectés")
      }
      localStorage.setItem(storageKey, sessionId)
      localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString())
    }

    checkTabs()
    this.tabCheckInterval = setInterval(checkTabs, 2000)
  }

  recordViolation(type, message) {
    const violation = {
      type,
      message,
      timestamp: new Date().toISOString(),
      testId: this.testId,
      candidateEmail: this.candidateEmail,
      elapsedTime: Date.now() - this.startTime,
    }

    this.violations.push(violation)

    // Sauvegarder immédiatement l'état après chaque violation
    // pour garantir la persistance même en cas de rafraîchissement inattendu
    this.persistState()

    if (this.onViolation) {
      this.onViolation(violation)
    }

    this.sendViolationToBackend(violation)
  }

  async sendViolationToBackend(violation) {
    try {
      const API_BASE_URL =
        typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      const url = `${API_BASE_URL}/api/admin/tests/${this.testId}/log-violation`

      console.log("[v0] Sending violation to backend:", {
        url,
        testId: this.testId,
        candidateEmail: this.candidateEmail,
        violationType: violation.type,
      })

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: this.candidateEmail,
          type: violation.type,
          message: violation.message,
          elapsedTime: violation.elapsedTime,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: violation.timestamp,
          },
        }),
      })

      if (!response.ok) {
        console.error("[v0] Failed to send violation - HTTP status:", response.status)
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
      } else {
        const data = await response.json()
        console.log("[v0] Violation sent successfully:", data)
      }
    } catch (error) {
      console.error("[v0] Error sending violation to backend:", {
        error: error.message,
        testId: this.testId,
        candidateEmail: this.candidateEmail,
      })
    }
  }

  getViolationsSummary() {
    return {
      total: this.violations.length,
      tabSwitchCount: this.tabSwitchCount,
      blurCount: this.blurCount,
      copyAttempts: this.copyAttempts,
      pasteAttempts: this.pasteAttempts,
      rightClickAttempts: this.rightClickAttempts,
      devToolsAttempts: this.devToolsAttempts,
      violations: this.violations,
    }
  }

  cleanup() {
    this.stop()
    if (this.tabCheckInterval) {
      clearInterval(this.tabCheckInterval)
    }
    const storageKey = `test_active_${this.testId}`
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${storageKey}_timestamp`)
  }
}
