const renderAgeFromDifferentDateRange = getDate => {
  const startDate = new Date(getDate).getFullYear()
  const endDate = new Date().getFullYear()

  return endDate - startDate
}

export default renderAgeFromDifferentDateRange
