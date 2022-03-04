import React from "react"
import PropTypes from "prop-types"
import * as XLSX from "xlsx"
import { Button } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileExcel } from "@fortawesome/free-solid-svg-icons"

const ExportToExcel = ({ apiData, fileName, sheetName, statusCode }) => {
  const fileExtension = ".xlsx"

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData)
    const wb = { Sheets: { [sheetName]: ws }, SheetNames: [`${sheetName}`] }
    XLSX.writeFile(wb, fileName + fileExtension)
  }

  const displayStatus = code => {
    switch (code) {
      case `0`:
        return `ไม่มีข้อมูลสำหรับนำออก`

      case `connection`:
        return `การเชื่อมต่อไม่สำเร็จ`

      default:
        return `กำลังโหลดข้อมูล...`
    }
  }

  return apiData.length > 0 ? (
    <Button
      color="primary"
      variant="contained"
      onClick={() => exportToCSV(apiData, fileName)}
    >
      <FontAwesomeIcon
        icon={faFileExcel}
        style={{ marginRight: 8, fontSize: 22 }}
      />
      <span>นำออกไฟล์ .xlsx</span>
    </Button>
  ) : (
    <Button color="primary" variant="contained" disabled>
      <span>{displayStatus(statusCode)}</span>
    </Button>
  )
}

ExportToExcel.propTypes = {
  apiData: PropTypes.array.isRequired,
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
  statusCode: PropTypes.string,
}

ExportToExcel.defaultProps = {
  apiData: [],
  fileName: `myfile`,
  sheetName: `data`,
  statusCode: ``,
}

export default ExportToExcel
