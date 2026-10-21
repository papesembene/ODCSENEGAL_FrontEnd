// Computed-style contract captured with Tailwind 3, without a real API or database.
import assert from "node:assert/strict"
import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import postcss from "postcss"
import { chromium } from "playwright"

const root = fileURLToPath(new URL("../../", import.meta.url))
const fixtures = [
  ["primary", "bg-primary text-primary-foreground border border-input rounded-md px-4 py-2"],
  ["card", "bg-card text-card-foreground rounded-lg border shadow-sm p-6"],
  ["muted", "bg-muted text-muted-foreground"],
  ["danger", "bg-red-200 text-red-900 border border-red-300"],
  ["orange", "bg-orange-500 text-white hover:bg-orange-600"],
  ["gray", "bg-gray-50 text-gray-900"],
  ["blue", "bg-blue-100 text-blue-800"],
  ["green", "bg-green-100 text-green-800"],
  ["shadow", "shadow rounded"],
  ["overlay", "bg-black/50"],
  ["small-radius", "rounded-sm"],
  ["large-shadow", "shadow-lg"],
  ["outline", "outline-hidden ring-2 ring-ring ring-offset-2"],
  ["button", "rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium"],
  ["input", "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground md:text-sm"],
  ["container", "container"],
  ["responsive", "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"],
  ["variable", "w-[var(--test-width)]"],
  ["shrink", "shrink-0"],
  ["grow", "grow"],
  ["label-stack", "space-y-2"],
  ["gradient", "bg-linear-to-r/srgb from-orange-500 to-orange-600"],
  ["native-input", "w-full rounded-md border px-4 py-2"],
  ["native-select", "w-full rounded-md border px-4 py-2"],
  ["native-textarea", "w-full rounded-md border px-4 py-2"],
  ["dialog", "rounded-lg border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0"],
]
const html = fixtures.map(([id, classes]) => {
  const attributes = `id="${id}" class="${classes}"`
  if (["native-input", "input"].includes(id)) return `<input ${attributes} placeholder="Test">`
  if (id === "button") return `<button ${attributes}>Test</button>`
  if (id === "native-select") return `<select ${attributes}><option>Test</option></select>`
  if (id === "native-textarea") return `<textarea ${attributes} placeholder="Test"></textarea>`
  return `<div ${attributes} data-state="open">${id === "label-stack"
    ? '<label class="text-sm leading-none">Test</label><input class="block h-10" placeholder="Test">'
    : '<input placeholder="Test"><span>Test</span>'}</div>`
}).join("")
const properties = ["backgroundColor", "backgroundImage", "color", "borderColor", "borderWidth", "borderRadius",
  "boxShadow", "height", "fontFamily", "fontSize", "fontWeight", "lineHeight", "paddingTop", "paddingLeft",
  "display", "gridTemplateColumns", "gap", "flexGrow", "flexShrink", "outlineColor", "outlineStyle", "outlineWidth",
  "outlineOffset", "cursor", "animationName", "animationDuration"]

let browser
try {
  let css
  if (process.env.ODC_STYLE_BASELINE_CSS) {
    css = await readFile(process.env.ODC_STYLE_BASELINE_CSS, "utf8")
  } else {
    const { default: tailwind } = await import("@tailwindcss/postcss")
    const input = await readFile(`${root}app/globals.css`, "utf8")
    const source = fixtures.flatMap(([, classes]) => classes.split(" ")).join(" ")
    css = (await postcss([tailwind()]).process(`${input}\n@source inline("${source}");`,
      { from: `${root}app/globals.css` })).css
  }
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  const page = await browser.newPage()
  await page.setContent(`<html><head></head><body style="--test-width:123px">${html}</body></html>`)
  await page.addStyleTag({ content: css })
  const results = {}
  for (const width of [390, 1024, 1536]) {
    await page.setViewportSize({ width, height: 900 })
    for (const dark of [false, true]) {
      await page.evaluate((enabled) => document.documentElement.classList.toggle("dark", enabled), dark)
      results[`${width}-${dark ? "dark" : "light"}`] = await page.evaluate(({ fixtures, properties }) => {
        const color = (value) => {
          const context = document.createElement("canvas").getContext("2d")
          context.fillStyle = value
          context.fillRect(0, 0, 1, 1)
          return [...context.getImageData(0, 0, 1, 1).data]
        }
        return Object.fromEntries(fixtures.map(([id]) => {
          const element = document.getElementById(id)
          const style = getComputedStyle(element)
          const values = Object.fromEntries(properties.map((property) =>
            [property, property.endsWith("Color") || property === "color" ? color(style[property]) : style[property]]))
          values.backgroundImage = values.backgroundImage.replace(" in srgb", "")
            .replace(/(rgb\([^)]*\)) 0%, (rgb\([^)]*\)) 100%\)/, "$1, $2)")
          // v4 adds transparent shadow layers; compare the visible result, not no-op layers.
          values.boxShadow = values.boxShadow.replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(?:, )?/g, "").replace(/, $/, "") || "none"
          if (style.outlineStyle === "none" || values.outlineColor[3] === 0) {
            Object.assign(values, { outlineColor: [0, 0, 0, 0], outlineStyle: "none", outlineWidth: "0px", outlineOffset: "0px" })
          }
          if (["container", "variable"].includes(id)) values.width = style.width
          if (element.matches("input, textarea")) values.placeholderColor = color(getComputedStyle(element, "::placeholder").color)
          return [id, values]
        }))
      }, { fixtures, properties })
    }
  }
  if (process.env.ODC_STYLE_CAPTURE) {
    await writeFile(process.env.ODC_STYLE_CAPTURE, JSON.stringify(results, null, 2) + "\n")
    console.log("Computed-style baseline captured")
  } else {
    const expected = JSON.parse(await readFile(new URL("./fixtures/styles.json", import.meta.url), "utf8"))
    for (const [variant, values] of Object.entries(results)) {
      const contract = Object.fromEntries(Object.entries(expected.base).map(([id, base]) =>
        [id, { ...base, ...expected.variants[variant]?.[id] }]))
      assert.deepEqual(values, contract, `Design contract: ${variant}`)
    }
    await page.emulateMedia({ forcedColors: "active" })
    const outline = await page.locator("#outline").evaluate((element) => {
      const style = getComputedStyle(element)
      return { width: style.outlineWidth, style: style.outlineStyle }
    })
    assert.deepEqual(outline, { width: "2px", style: "solid" }, "Keyboard focus must remain visible in forced-colors mode")
    console.log(`PASS: ${fixtures.length * 6} computed-style fixtures (${fixtures.length} components, 3 widths, light/dark)`)
  }
} finally {
  await browser?.close()
}
