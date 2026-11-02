"use client"

import { useState } from "react"
import FormationDetails from "@/components/odc/FormationDetails"
import PublicTrainingCatalog from "@/components/trainings/public-training-catalog"
import { useTrainingCatalog } from "@/components/trainings/training-catalog-provider"

export default function FormationsSection() {
  const [selectedCode, setSelectedCode] = useState(null)
  const catalog = useTrainingCatalog()
  const selected = catalog.items.find((item) => item.code === selectedCode)
  return <>
    <PublicTrainingCatalog items={catalog.items} onSelect={(item) => setSelectedCode(item.code)} />
    {selected && <FormationDetails formation={selected} onClose={() => setSelectedCode(null)} />}
  </>
}
