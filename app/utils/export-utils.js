"use client"

// Fonction pour convertir les données en CSV
export function convertToCSV(data) {
  if (!data || !data.length) return ""

  // Extraire les en-têtes (noms des propriétés) du premier objet
  const headers = Object.keys(data[0])

  // Créer la ligne d'en-tête
  const headerRow = headers.join(",")

  // Créer les lignes de données
  const rows = data
    .map((item) => {
      return headers
        .map((header) => {
          // Gérer les valeurs qui contiennent des virgules en les entourant de guillemets
          let value = item[header] === null || item[header] === undefined ? "" : item[header]
          value = String(value).replace(/"/g, '""') // Échapper les guillemets

          // Si la valeur contient des virgules, des sauts de ligne ou des guillemets, l'entourer de guillemets
          if (value.includes(",") || value.includes("\n") || value.includes('"')) {
            value = `"${value}"`
          }

          return value
        })
        .join(",")
    })
    .join("\n")

  // Combiner l'en-tête et les lignes
  return `${headerRow}\n${rows}`
}

// Fonction pour télécharger un fichier CSV
export function downloadCSV(data, filename = "export.csv") {
  const csv = convertToCSV(data)
  downloadFile(csv, filename, "text/csv")
}

export function exportToCSV(data, filename = "export.csv") {
  downloadCSV(data, filename)
}

// Fonction pour convertir les données en Excel (XLSX)
export async function downloadExcel(data, filename = "export.xlsx") {
  try {
    // Importer dynamiquement la bibliothèque xlsx
    const XLSX = await import("xlsx")

    // Créer une feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Créer un classeur
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Convertir le buffer en Blob
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    // Télécharger le fichier
    downloadBlob(blob, filename)
  } catch (error) {
    console.error("Erreur lors de la génération du fichier Excel:", error)
    alert("Une erreur est survenue lors de la génération du fichier Excel. Veuillez réessayer.")
  }
}

export async function exportToExcel(data, filename = "export.xlsx") {
  return downloadExcel(data, filename)
}

// Fonction pour convertir les données en PDF
export async function downloadPDF(data, filename = "export.pdf", title = "Exported Data") {
  try {
    // Importer dynamiquement la bibliothèque jspdf et jspdf-autotable
    const { jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")

    // Créer un nouveau document PDF
    const doc = new jsPDF()

    // Ajouter un titre
    doc.text(title, 14, 15)

    // Extraire les en-têtes et les données pour le tableau
    const headers = Object.keys(data[0])
    const rows = data.map((item) => headers.map((header) => item[header]))

    // Ajouter le tableau au document
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // Télécharger le fichier PDF
    doc.save(filename)
  } catch (error) {
    console.error("Erreur lors de la génération du fichier PDF:", error)
    alert("Une erreur est survenue lors de la génération du fichier PDF. Veuillez réessayer.")
  }
}

export async function exportToPDF(data, filename = "export.pdf", title = "Exported Data") {
  return downloadPDF(data, filename, title)
}

// Fonction utilitaire pour télécharger un fichier
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType })
  downloadBlob(blob, filename)
}

// Fonction utilitaire pour télécharger un Blob
function downloadBlob(blob, filename) {
  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename

  // Ajouter le lien au document, cliquer dessus, puis le supprimer
  document.body.appendChild(link)
  link.click()

  // Nettoyer
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }, 0)
}
