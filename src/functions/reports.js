const exportedDataSelect = [
  { id: 1, name: `ทั้ง ทบ.` },
  { id: 2, name: `ตามสังกัด` },
]

const displayStatus = code => {
  switch (code) {
    case ``:
      return `การเตรียมข้อมูลสำหรับการออกรายงานสำเร็จ`

    case `0`:
      return `ไม่มีข้อมูลสำหรับการออกรายงาน`

    case `selecting`:
      return `เลือกประเภทข้อมูลสำหรับการออกรายงาน`

    case `selecting-unit`:
      return `เลือกสังกัดที่ต้องการออกรายงาน`

    case `connection`:
      return `การเชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อของอุปกรณ์`

    case `loading`:
      return `กำลังโหลดข้อมูล...`

    default:
      return ``
  }
}

const printSeverity = value => {
  switch (value) {
    case ``:
      return `success`

    case `selecting`:
    case `selecting-unit`:
    case `loading`:
      return `info`

    default:
      return `warning`
  }
}

export { exportedDataSelect, displayStatus, printSeverity }
