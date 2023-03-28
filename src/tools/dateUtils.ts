export const getDaysDiff = (startDate: string, endDate: string): number | string => {
  if (!startDate || !endDate) {
    return '*днів'
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  const startMiliseconds = start.getTime()
  const endMiliseconds = end.getTime()

  const diffInMiliseconds = endMiliseconds - startMiliseconds

  return Math.ceil(diffInMiliseconds / 1000 / 60 / 60 / 24)
}
