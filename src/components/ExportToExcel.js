import React from "react"
import PropTypes from "prop-types"
import * as XLSX from "xlsx"

const ExportToExcel = ({ apiData, fileName, sheetName }) => {
  const fileExtension = ".xlsx"

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData)
    const wb = { Sheets: { [sheetName]: ws }, SheetNames: [`${sheetName}`] }
    XLSX.writeFile(wb, fileName + fileExtension)
  }

  return <button onClick={e => exportToCSV(apiData, fileName)}>Export</button>
}

ExportToExcel.propTypes = {
  apiData: PropTypes.array.isRequired,
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
}

ExportToExcel.defaultProps = {
  apiData: [],
  fileName: `myfile`,
  sheetName: `data`,
}

export default ExportToExcel
