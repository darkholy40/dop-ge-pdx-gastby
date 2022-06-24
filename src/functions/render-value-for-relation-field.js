const renderValueForRelationField = obj => {
  if (obj !== null) {
    return `"${obj._id}"`
  }

  return null
}

export default renderValueForRelationField
