import assert from "node:assert/strict"
import { spawn } from "node:child_process"

export async function startBrowserServer(baseUrl) {
  if (process.env.ODC_BROWSER_START_SERVER !== "1") return null
  const url = new URL(baseUrl)
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname), "Test server must bind locally")
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1",
    "-p", url.port || "3101"], { stdio: "ignore" })
  let failure
  server.on("error", (error) => { failure = error })
  const deadline = Date.now() + 45000
  try {
    while (Date.now() < deadline) {
      if (failure) throw failure
      assert.equal(server.exitCode, null, "Test server exited before becoming ready")
      try {
        if ((await fetch(`${baseUrl}/astrodmin`, { signal: AbortSignal.timeout(2000) })).ok) return server
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    throw new Error("Local production server did not become ready")
  } catch (error) {
    server.kill("SIGTERM")
    throw error
  }
}
