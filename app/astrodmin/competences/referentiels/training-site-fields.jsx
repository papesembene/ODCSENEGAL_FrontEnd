import Link from "@/components/ui/interactive-link"

export default function TrainingSiteFields({ manager }) {
  const { form, catalog, update } = manager
  return <fieldset className="space-y-3 rounded-lg border p-4">
    <legend className="px-1 text-sm font-semibold">Sites proposant cette formation *</legend>
    <div className="grid gap-3 sm:grid-cols-2">{catalog.sites.map((site) => <label key={site.code} className="flex items-center gap-3 rounded-md border p-3 text-sm">
      <input type="checkbox" checked={form.siteIds.includes(site.code)} disabled={site.status === "archived" && !form.siteIds.includes(site.code)}
        onChange={(event) => update("siteIds", event.target.checked ? [...form.siteIds, site.code] : form.siteIds.filter((code) => code !== site.code))}
        className="h-4 w-4 accent-orange-500" />
      {site.name}{site.status === "archived" ? " (archivé)" : ""}
    </label>)}</div>
    <p className="text-xs text-muted-foreground">Le candidat choisira d'abord son site de formation, indépendamment de sa résidence.</p>
    <Link href="/astrodmin/competences/referentiels/sites" className="inline-block text-sm underline underline-offset-4">Gérer les sites de formation</Link>
  </fieldset>
}
