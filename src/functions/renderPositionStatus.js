const renderPositionStatus = (personType, haveABudget) => {
  switch (personType) {
    case `พนักงานราชการ`:
      return `มีคนถือครอง`

    case `ลูกจ้างประจำ`:
      return `ตำแหน่งที่มีลูกจ้างประจำครองอยู่`

    case `-`:
      if (haveABudget) {
        return `ตำแหน่งว่างมีเงิน`
      } else {
        return `ตำแหน่งว่างไม่มีเงิน`
      }

    default:
      return `-`
  }
}

export default renderPositionStatus
