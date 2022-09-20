const monthText = {
  short: {
    0: `ม.ค.`,
    1: `ก.พ.`,
    2: `มี.ค.`,
    3: `เม.ย.`,
    4: `พ.ค.`,
    5: `มิ.ย.`,
    6: `ก.ค.`,
    7: `ส.ค.`,
    8: `ก.ย.`,
    9: `ต.ค.`,
    10: `พ.ย.`,
    11: `ธ.ค.`,
  },
  long: {
    0: `มกราคม`,
    1: `กุมภาพันธ์`,
    2: `มีนาคม`,
    3: `เมษายน`,
    4: `พฤษภาคม`,
    5: `มิถุนายน`,
    6: `กรกฎาคม`,
    7: `สิงหาคม`,
    8: `กันยายน`,
    9: `ตุลาคม`,
    10: `พฤศจิกายน`,
    11: `ธันวาคม`,
  },
}

const renderTableDate = (getDateFromDB, opt) => {
  if (getDateFromDB !== null) {
    const myDate = new Date(getDateFromDB)

    const year = `${myDate.getFullYear() + 543}`
    const month = `${myDate.getMonth()}`
    const date = `${myDate.getDate()}`

    const hr =
      myDate.getHours() < 10 ? `0${myDate.getHours()}` : `${myDate.getHours()}`
    const min =
      myDate.getMinutes() < 10
        ? `0${myDate.getMinutes()}`
        : `${myDate.getMinutes()}`
    const sec =
      myDate.getSeconds() < 10
        ? `0${myDate.getSeconds()}`
        : `${myDate.getSeconds()}`

    switch (opt) {
      case `date`:
        return `${date} ${monthText.short[month]} ${year}`

      case `full-date`:
        return `${date} ${monthText.long[month]} ${year}`

      case `time`:
        return `${hr}:${min}`

      case `full-time`:
        return `${hr}:${min}:${sec}`

      case `datetime`:
        return `${date} ${monthText.short[month]} ${year} ${hr}:${min}:${sec}`

      case `full-datetime`:
        return `${date} ${monthText.long[month]} ${year} ${hr}:${min}:${sec}`

      case `file-datetime`:
        return `วันที่ ${date} ${monthText.long[month]} ${year} เวลา ${hr}.${min}`

      default:
        return `${date} ${monthText.short[month]} ${year}`
    }
  }

  return ``
}

export default renderTableDate
