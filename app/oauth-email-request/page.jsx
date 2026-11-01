import { redirect } from "next/navigation"

export default function RemovedExternalLogin() {
  redirect("/login")
}
