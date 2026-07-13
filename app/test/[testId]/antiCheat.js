"use client"

import {
  createSessionId,
  getAntiCheatSessionKey,
  getAntiCheatTabKey,
  readPersistedState,
  removeAntiCheatTabState,
  sendViolationToBackend,
  writePersistedState,
} from "./anti-cheat-utils"

export class AntiCheatService {
  constructor(testId, candidateEmail, onViolation) {
    this.testId = testId
    this.candidateEmail = candidateEmail
    this.onViolation = onViolation || (() => {})

    const sessionKey = getAntiCheatSessionKey(testId)
    this.sessionId = sessionStorage.getItem(sessionKey) || createSessionId()
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
    this.persistenceInterval = null
    this.tabCheckInterval = null
    this.beforeUnloadHandler = null
    this.restoreCanvasToBlob = null
    this.screenshotProtectionOverlay = null

    this.boundHandlers = {
      beforeUnload: () => this.persistState(),
      blur: () => this.handleBlur(),
      contextMenu: (event) => this.handleRightClick(event),
      copy: (event) => this.handleCopy(event),
      cut: (event) => this.handleCopy(event),
      focus: () => this.handleFocus(),
      keyDown: (event) => this.handleKeyDown(event),
      paste: (event) => this.handlePaste(event),
      screenshotKeyDown: (event) => this.handleScreenshotShortcut(event),
      visibilityChange: () => this.handleVisibilityChange(),
    }

    this.restorePersistentState()
  }

  start() {
    if (this.isActive) {
      return
    }

    this.detectReload()
    this.isActive = true
    this.initializeAudioContext()
    this.setupEventListeners()
    this.detectMultipleTabs()
    this.enableScreenshotProtection()

    this.persistenceInterval = setInterval(() => this.persistState(), 5000)
    this.persistState()
  }

  stop() {
    if (!this.isActive) {
      return
    }

    this.isActive = false
    this.removeEventListeners()
    this.disableScreenshotProtection()

    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval)
      this.persistenceInterval = null
    }

    this.persistState()
  }

  cleanup() {
    this.stop()

    if (this.tabCheckInterval) {
      clearInterval(this.tabCheckInterval)
      this.tabCheckInterval = null
    }

    removeAntiCheatTabState(this.testId)
  }

  persistState() {
    writePersistedState(this.testId, {
      blurCount: this.blurCount,
      copyAttempts: this.copyAttempts,
      devToolsAttempts: this.devToolsAttempts,
      pasteAttempts: this.pasteAttempts,
      reloadAttempts: this.reloadAttempts,
      rightClickAttempts: this.rightClickAttempts,
      sessionId: this.sessionId,
      startTime: this.startTime,
      tabSwitchCount: this.tabSwitchCount,
      violations: this.violations,
    })
  }

  restorePersistentState() {
    const state = readPersistedState(this.testId)
    if (!state) {
      return
    }

    this.violations = Array.isArray(state.violations) ? state.violations : []
    this.reloadAttempts = Number(state.reloadAttempts) || 0
    this.tabSwitchCount = Number(state.tabSwitchCount) || 0
    this.blurCount = Number(state.blurCount) || 0
    this.copyAttempts = Number(state.copyAttempts) || 0
    this.pasteAttempts = Number(state.pasteAttempts) || 0
    this.rightClickAttempts = Number(state.rightClickAttempts) || 0
    this.devToolsAttempts = Number(state.devToolsAttempts) || 0
    this.startTime = Number(state.startTime) || Date.now()
    this.sessionId = state.sessionId || this.sessionId
  }

  detectReload() {
    const navigationEntries = performance.getEntriesByType("navigation")
    if (navigationEntries[0]?.type === "reload") {
      this.reloadAttempts += 1
      this.recordViolation("reload", `Rechargement de la page détecté (${this.reloadAttempts} fois)`)
      setTimeout(() => this.playAlertSound(900, 350), 500)
    }
  }

  initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
    } catch (error) {
      console.error("Audio Context non supporté:", error)
    }
  }

  playAlertSound(frequency = 800, duration = 300) {
    const now = Date.now()
    if (now - this.lastAudioTime < this.audioDebounceMs || !this.audioContext) {
      return
    }

    this.lastAudioTime = now

    try {
      const ctx = this.audioContext
      const durationSec = duration / 1000
      const oscillatorOne = ctx.createOscillator()
      const oscillatorTwo = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()

      oscillatorOne.type = "square"
      oscillatorTwo.type = "sawtooth"
      oscillatorOne.frequency.value = frequency
      oscillatorTwo.frequency.value = frequency * 1.5

      lfo.type = "sine"
      lfo.frequency.value = 6
      lfoGain.gain.value = frequency * 0.3

      oscillatorOne.connect(gainNode)
      oscillatorTwo.connect(gainNode)
      lfo.connect(lfoGain)
      lfoGain.connect(oscillatorOne.frequency)
      gainNode.connect(ctx.destination)

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + durationSec * 0.9)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationSec)

      oscillatorOne.start(ctx.currentTime)
      oscillatorTwo.start(ctx.currentTime)
      lfo.start(ctx.currentTime)

      oscillatorOne.stop(ctx.currentTime + durationSec)
      oscillatorTwo.stop(ctx.currentTime + durationSec)
      lfo.stop(ctx.currentTime + durationSec)
    } catch (error) {
      console.error("Erreur lors de la lecture du son d'alerte:", error)
    }
  }

  setupEventListeners() {
    document.addEventListener("copy", this.boundHandlers.copy, true)
    document.addEventListener("cut", this.boundHandlers.cut, true)
    document.addEventListener("paste", this.boundHandlers.paste, true)
    document.addEventListener("contextmenu", this.boundHandlers.contextMenu, true)
    document.addEventListener("keydown", this.boundHandlers.keyDown, true)
    document.addEventListener("keydown", this.boundHandlers.screenshotKeyDown, true)
    document.addEventListener("visibilitychange", this.boundHandlers.visibilityChange)
    window.addEventListener("blur", this.boundHandlers.blur)
    window.addEventListener("focus", this.boundHandlers.focus)
    window.addEventListener("beforeunload", this.boundHandlers.beforeUnload)
  }

  removeEventListeners() {
    document.removeEventListener("copy", this.boundHandlers.copy, true)
    document.removeEventListener("cut", this.boundHandlers.cut, true)
    document.removeEventListener("paste", this.boundHandlers.paste, true)
    document.removeEventListener("contextmenu", this.boundHandlers.contextMenu, true)
    document.removeEventListener("keydown", this.boundHandlers.keyDown, true)
    document.removeEventListener("keydown", this.boundHandlers.screenshotKeyDown, true)
    document.removeEventListener("visibilitychange", this.boundHandlers.visibilityChange)
    window.removeEventListener("blur", this.boundHandlers.blur)
    window.removeEventListener("focus", this.boundHandlers.focus)
    window.removeEventListener("beforeunload", this.boundHandlers.beforeUnload)
  }

  enableScreenshotProtection() {
    this.screenshotProtectionOverlay = document.createElement("div")
    this.screenshotProtectionOverlay.id = "screenshot-protection-overlay"
    this.screenshotProtectionOverlay.style.position = "fixed"
    this.screenshotProtectionOverlay.style.top = "0"
    this.screenshotProtectionOverlay.style.left = "0"
    this.screenshotProtectionOverlay.style.width = "100%"
    this.screenshotProtectionOverlay.style.height = "100%"
    this.screenshotProtectionOverlay.style.zIndex = "-9999"
    this.screenshotProtectionOverlay.style.pointerEvents = "none"
    this.screenshotProtectionOverlay.setAttribute("data-test-protected", "true")
    document.body.appendChild(this.screenshotProtectionOverlay)

    if (window.HTMLCanvasElement && !this.restoreCanvasToBlob) {
      const originalToBlob = HTMLCanvasElement.prototype.toBlob
      HTMLCanvasElement.prototype.toBlob = function (...args) {
        this.recordViolation("canvas_export_attempt", "Tentative d'export canvas détectée")
        this.playAlertSound(900, 350)
        return originalToBlob.apply(this, args)
      }.bind(this)

      this.restoreCanvasToBlob = () => {
        HTMLCanvasElement.prototype.toBlob = originalToBlob
      }
    }
  }

  disableScreenshotProtection() {
    if (this.screenshotProtectionOverlay) {
      this.screenshotProtectionOverlay.remove()
      this.screenshotProtectionOverlay = null
    }

    if (this.restoreCanvasToBlob) {
      this.restoreCanvasToBlob()
      this.restoreCanvasToBlob = null
    }
  }

  handleCopy(event) {
    if (!this.isActive) {
      return
    }

    this.copyAttempts += 1
    this.recordViolation("copy", `Tentative de copie détectée (${this.copyAttempts} fois)`)
    this.playAlertSound(600, 250)
    event.preventDefault()
    event.stopPropagation()
  }

  handlePaste(event) {
    if (!this.isActive) {
      return
    }

    this.pasteAttempts += 1
    this.recordViolation("paste", `Tentative de collage détectée (${this.pasteAttempts} fois)`)
    this.playAlertSound(600, 250)
    event.preventDefault()
    event.stopPropagation()
  }

  handleRightClick(event) {
    if (!this.isActive) {
      return
    }

    this.rightClickAttempts += 1
    this.recordViolation("right_click", `Clic droit détecté (${this.rightClickAttempts} fois)`)
    this.playAlertSound(700, 250)
    event.preventDefault()
    event.stopPropagation()
  }

  handleBlur() {
    if (!this.isActive) {
      return
    }

    this.blurCount += 1
    this.recordViolation("blur", `Perte de focus (${this.blurCount} fois)`)
    this.playAlertSound(950, 300)
  }

  handleFocus() {}

  handleVisibilityChange() {
    if (!this.isActive || !document.hidden) {
      return
    }

    this.tabSwitchCount += 1
    this.recordViolation("tab_switch", `Changement d'onglet détecté (${this.tabSwitchCount} fois)`)
    this.playAlertSound(1050, 400)
  }

  handleKeyDown(event) {
    if (!this.isActive) {
      return
    }

    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase()
      if (["c", "v", "a", "x"].includes(key)) {
        this.recordViolation("keyboard_shortcut", `Raccourci clavier détecté: Ctrl+${key.toUpperCase()}`)
        this.playAlertSound(700, 250)
        event.preventDefault()
        event.stopPropagation()
      }
    }

    if (
      event.key === "F12" ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(event.key.toLowerCase())) ||
      (event.ctrlKey && event.key.toLowerCase() === "u")
    ) {
      this.devToolsAttempts += 1
      this.recordViolation("devtools", `Tentative d'ouverture des outils développeur (${this.devToolsAttempts} fois)`)
      this.playAlertSound(800, 350)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  handleScreenshotShortcut(event) {
    if (!this.isActive) {
      return
    }

    const isPrintScreen = event.key === "PrintScreen" || event.keyCode === 44 || (event.shiftKey && event.keyCode === 44)
    const isCtrlShiftS = event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s"

    if (!isPrintScreen && !isCtrlShiftS) {
      return
    }

    this.recordViolation(
      isCtrlShiftS ? "screenshot_attempt_shortcut" : "screenshot_attempt_printscreen",
      isCtrlShiftS ? "Tentative de capture d'écran via Ctrl+Shift+S" : "Tentative de capture d'écran via Print Screen",
    )
    this.playAlertSound(1000, 400)
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  detectMultipleTabs() {
    const tabKey = getAntiCheatTabKey(this.testId)
    const checkTabs = () => {
      if (!this.isActive) {
        return
      }

      const activeSession = localStorage.getItem(tabKey)
      if (activeSession && activeSession !== this.sessionId) {
        this.recordViolation("multiple_tabs", "Plusieurs onglets du test détectés")
      }

      localStorage.setItem(tabKey, this.sessionId)
      localStorage.setItem(`${tabKey}_timestamp`, Date.now().toString())
    }

    checkTabs()
    this.tabCheckInterval = setInterval(checkTabs, 2000)
  }

  recordViolation(type, message) {
    const violation = {
      candidateEmail: this.candidateEmail,
      elapsedTime: Date.now() - this.startTime,
      message,
      testId: this.testId,
      timestamp: new Date().toISOString(),
      type,
    }

    this.violations.push(violation)
    this.persistState()
    this.onViolation(violation)
    sendViolationToBackend(violation)
  }

  getViolationsSummary() {
    return {
      blurCount: this.blurCount,
      copyAttempts: this.copyAttempts,
      devToolsAttempts: this.devToolsAttempts,
      pasteAttempts: this.pasteAttempts,
      rightClickAttempts: this.rightClickAttempts,
      tabSwitchCount: this.tabSwitchCount,
      total: this.violations.length,
      violations: this.violations,
    }
  }
}
