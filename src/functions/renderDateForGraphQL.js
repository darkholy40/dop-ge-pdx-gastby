const renderDateForGraphQL = date => {
  if (Object.prototype.toString.call(date) === "[object Date]") {
    date.setHours(7, 0, 0, 0)

    return `"${date.toISOString()}"`
  } else {
    if (date !== null) {
      return `"${date}"`
    }
  }

  return null
}

export default renderDateForGraphQL
