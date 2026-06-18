"use client"

import { useState } from "react"
import {
  StartupDashboardHeader,
  StartupDashboardTabs,
} from "./startup-dashboard-sections"
import {
  STARTUP_DASHBOARD_DATA,
  STARTUP_DASHBOARD_QUICK_LINKS,
  STARTUP_DASHBOARD_STATS,
} from "./startup-dashboard-data"
import { StartupDashboardSidebar } from "./startup-dashboard-sidebar"

export default function StartupDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto px-4 py-8">
      <StartupDashboardHeader startupData={STARTUP_DASHBOARD_DATA} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <StartupDashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            startupData={STARTUP_DASHBOARD_DATA}
            stats={STARTUP_DASHBOARD_STATS}
          />
        </div>

        <StartupDashboardSidebar
          messages={STARTUP_DASHBOARD_DATA.messages}
          mentor={STARTUP_DASHBOARD_DATA.mentor}
          quickLinks={STARTUP_DASHBOARD_QUICK_LINKS}
        />
      </div>
    </div>
  )
}
