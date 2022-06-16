const isNumeric = input => {
  let RE =
    /^-?(0|INF|(0[1-7][0-7]*)|(0x[0-9a-fA-F]+)|((0|[1-9][0-9]*|(?=[.,]))([.,][0-9]+)?([eE]-?\d+)?))$/
  return RE.test(input)
}

const checkPid = id => {
  if (!isNumeric(id)) return false
  if (id.substring(0, 1) === 0) return false
  if (id.length !== 13) return false

  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseFloat(id.charAt(i)) * (13 - i)
  if ((11 - (sum % 11)) % 10 !== parseFloat(id.charAt(12))) return false
  return true
}

export default checkPid
