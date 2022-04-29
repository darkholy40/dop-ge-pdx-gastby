import React from "react"
import PropTypes from "prop-types"
import * as XLSX from "xlsx"
import { Button } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileExcel } from "@fortawesome/free-solid-svg-icons"

const ExportToExcel = ({ apiData, fileName, sheetName, disabled }) => {
  const fileExtension = ".xlsx"

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData)
    const wb = { Sheets: { [sheetName]: ws }, SheetNames: [`${sheetName}`] }
    XLSX.writeFile(wb, fileName + fileExtension)
  }

  return !disabled ? (
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
      <FontAwesomeIcon
        icon={faFileExcel}
        style={{ marginRight: 8, fontSize: 22 }}
      />
      <span>นำออกไฟล์ .xlsx</span>
    </Button>
  )
}

ExportToExcel.propTypes = {
  apiData: PropTypes.array.isRequired,
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
  disabled: PropTypes.bool,
}

ExportToExcel.defaultProps = {
  apiData: [],
  fileName: `myfile`,
  sheetName: `data`,
  disabled: false,
}

export default ExportToExcel
