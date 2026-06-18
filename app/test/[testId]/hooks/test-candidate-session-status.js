export function getTestAvailabilityState(test) {
  const now = new Date()
  const testDate = new Date(`${test.scheduledDate}T${test.scheduledTime}`)
  const testEndTime = new Date(testDate.getTime() + test.duration * 60000)

  if (now < testDate) {
    return { status: "too_early", testDate }
  }

  if (now > testEndTime) {
    return { status: "expired", testDate }
  }

  if (test.status !== "active") {
    return { status: "inactive", testDate }
  }

  return { status: "available", testDate }
}

export function getTestStartState(test) {
  const now = new Date()
  const testDate = new Date(`${test.scheduledDate}T${test.scheduledTime}`)
  const elapsedMinutes = Math.floor((now.getTime() - testDate.getTime()) / 60000)
  const remainingMinutes = Math.max(0, test.duration - elapsedMinutes)

  return {
    isLateStart: remainingMinutes < test.duration,
    remainingMinutes,
  }
}
