// const month = {
//   "01": `ม.ค.`,
//   "02": `ก.พ.`,
//   "03": `มี.ค.`,
//   "04": `เม.ย.`,
//   "05": `พ.ค.`,
//   "06": `มิ.ย.`,
//   "07": `ก.ค.`,
//   "08": `ส.ค.`,
//   "09": `ก.ย.`,
//   10: `ต.ค.`,
//   11: `พ.ย.`,
//   12: `ธ.ค.`,
// }

const renderThaiDate = stringDate => {
  if (stringDate !== null) {
    const y = stringDate.split("T")[0].split("-")[0]
    const m = stringDate.split("T")[0].split("-")[1]
    const d = stringDate.split("T")[0].split("-")[2]

    // return `${d} ${month[m]} ${parseInt(y) + 543}`
    return `${d}/${m}/${parseInt(y) + 543}`
  }

  return ``
}

export default renderThaiDate
