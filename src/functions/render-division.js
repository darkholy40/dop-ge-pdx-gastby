const renderDivision = divisionObj => {
  let returnText = ``

  if (divisionObj !== null) {
    if (divisionObj.division1) {
      returnText = divisionObj.division1
    }

    if (divisionObj.division2) {
      returnText = divisionObj.division2
    }

    if (divisionObj.division3) {
      returnText = divisionObj.division3
    }
  }

  return returnText
}

export default renderDivision
