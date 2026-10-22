import { useCallback, useEffect, useState } from "react"
import { useAdminPage } from "@/app/hooks/use-admin-page"
import { useDebouncedValue } from "@/app/hooks/use-debounced-value"
import { API_BASE_URL } from "../constants"

export function useTestSessions(enabled) {
  const [query, setQuery] = useState({ page: 1, per_page: 20, search: "", status: "all", testId: "all" })
  const [sessionsSearchTerm, setSessionsSearchTerm] = useState("")
  const search = useDebouncedValue(sessionsSearchTerm.trim())
  const [revision, setRevision] = useState(0)
  const fetchTestSessions = useCallback(() => setRevision((value) => value + 1), [])
  const page = useAdminPage(`${API_BASE_URL}/api/admin/tests/sessions`, query, enabled, revision)
  const sessionsLoading = page.loading || sessionsSearchTerm.trim() !== query.search

  useEffect(() => {
    setQuery((previous) => previous.search === search ? previous : { ...previous, search, page: 1 })
  }, [search])

  const changeQuery = (key, value) => setQuery((previous) => ({
    ...previous, page: 1, [key]: typeof value === "function" ? value(previous[key]) : value,
  }))

  return {
    testSessions: sessionsLoading ? [] : page.response.data, testSessionsTotal: page.response.total,
    sessionsLoading, sessionsError: page.error, fetchTestSessions,
    sessionsSearchTerm, setSessionsSearchTerm,
    sessionsPage: page.response.page ?? query.page, setSessionsPage: (value) => changeQuery("page", value),
    sessionsItemsPerPage: query.per_page, setSessionsItemsPerPage: (value) => changeQuery("per_page", value),
    sessionsStatusFilter: query.status, setSessionsStatusFilter: (value) => changeQuery("status", value),
    sessionsTestFilter: query.testId, setSessionsTestFilter: (value) => changeQuery("testId", value),
  }
}
