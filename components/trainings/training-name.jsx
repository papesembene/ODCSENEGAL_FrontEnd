"use client"

import { findTraining } from "@/lib/training-catalog"
import { useTrainingCatalog } from "./training-catalog-provider"

export default function TrainingName({ value }) {
  const { items } = useTrainingCatalog()
  return findTraining(value, items)?.title || value || "-"
}
