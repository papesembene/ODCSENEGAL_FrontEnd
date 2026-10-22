function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export async function downloadCandidateExport(blob, format) {
  if (format === "csv") {
    download(blob, "candidats-competences.csv")
    return
  }
  const XLSX = await import("xlsx")
  // Parse as text to preserve phone numbers and prevent formula interpretation.
  const workbook = XLSX.read(await blob.text(), { type: "string", raw: true, cellFormula: false })
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  download(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "candidats-competences.xlsx")
}
