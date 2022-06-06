const renderNumberAsText = (getValue, digit) => {
  let returnDigit = `0`

  if (parseInt(digit) > 0) {
    returnDigit = `0.`

    for (let i = 0; i < digit; i++) {
      returnDigit = `${returnDigit}0`
    }
  }

  return getValue !== `` ? parseInt(getValue).toFixed(digit) : returnDigit
}

export default renderNumberAsText
