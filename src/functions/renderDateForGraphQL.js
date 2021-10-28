const renderDateForGraphQL = date => {
  if (Object.prototype.toString.call(date) === "[object Date]") {
    return date.toISOString().split("T")[0]
  }

  return null
}

export default renderDateForGraphQL
