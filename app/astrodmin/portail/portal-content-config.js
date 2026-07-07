import { Eye, Megaphone, Newspaper } from "lucide-react"

export const CONTENT_TYPES = [
  { value: "banner", label: "Bannière", icon: Megaphone },
  { value: "news", label: "Nouveauté", icon: Newspaper },
  { value: "info", label: "Information", icon: Eye },
]

export const STATUS_LABELS = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
}

export const EMPTY_PORTAL_CONTENT_FORM = {
  type: "banner",
  title: "",
  summary: "",
  body: "",
  category: "",
  imageUrl: "",
  linkLabel: "",
  linkUrl: "",
  placement: "home",
  priority: 0,
  isPinned: false,
  status: "draft",
  startsAt: "",
  endsAt: "",
}

export function formatPortalContentDate(value) {
  if (!value) {
    return "-"
  }
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function getPortalContentTypeLabel(type) {
  return CONTENT_TYPES.find((item) => item.value === type)?.label || type
}

export function normalizePortalContentForm(content) {
  if (!content) {
    return EMPTY_PORTAL_CONTENT_FORM
  }
  return {
    type: content.type || "banner",
    title: content.title || "",
    summary: content.summary || "",
    body: content.body || "",
    category: content.category || "",
    imageUrl: content.imageUrl || "",
    linkLabel: content.linkLabel || "",
    linkUrl: content.linkUrl || "",
    placement: content.placement || "home",
    priority: content.priority ?? 0,
    isPinned: Boolean(content.isPinned),
    status: content.status || "draft",
    startsAt: content.startsAt ? content.startsAt.slice(0, 16) : "",
    endsAt: content.endsAt ? content.endsAt.slice(0, 16) : "",
  }
}
