import React from "react"
import PropTypes from "prop-types"
import * as XLSX from "xlsx-js-style"
import { Button } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileExcel } from "@fortawesome/free-solid-svg-icons"

const ExportToExcel = ({
  apiData,
  wsConfigs,
  fileName,
  sheetName,
  disabled,
  callback,
}) => {
  const fileExtension = `.xlsx`

  const exportToCSV = (apiData, fileName) => {
    let ws = XLSX.utils.json_to_sheet(apiData)

    for (let con of wsConfigs) {
      if (con.name !== undefined && con.data !== undefined) {
        ws[con.name] = con.data
      }
    }

    // styling for all cells
    for (let i in ws) {
      if (typeof ws[i] != `object`) continue
      let cell = XLSX.utils.decode_cell(i)

      ws[i].s = {
        font: {
          name: `TH SarabunPSK`,
          sz: 16,
        },
      }
      ws[i].z = `@` // format cell to "Text" category

      // first row
      if (cell.r === 0) {
        ws[i].s = {
          ...ws[i].s, // keep old styles
          font: {
            ...ws[i].s.font,
            bold: true,
          },
          // alignment: {
          //   vertical: `center`,
          //   horizontal: `center`,
          //   wrapText: `1`, // any truthy value here
          // },
          border: {
            bottom: {
              style: `thin`,
              color: { rgb: `1976D2` },
            },
          },
          fill: {
            fgColor: { rgb: `E3F2FD` },
          },
        }
      }

      // every other row
      if (cell.r % 2) {
        ws[i].s = {
          ...ws[i].s, // keep old styles
          // fill background color
          fill: {
            patternType: `solid`,
            fgColor: { rgb: `EFEFEF` },
            bgColor: { rgb: `EFEFEF` },
          },
        }
      }
    }

    const wb = { Sheets: { [sheetName]: ws }, SheetNames: [`${sheetName}`] }
    XLSX.writeFile(wb, fileName + fileExtension)
  }

  return !disabled ? (
    <Button
      color="primary"
      variant="contained"
      onClick={() => {
        exportToCSV(apiData, fileName)
        callback()
      }}
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
  wsConfigs: PropTypes.array,
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
  disabled: PropTypes.bool,
  callback: PropTypes.func,
}

ExportToExcel.defaultProps = {
  wsConfigs: [],
  fileName: `myfile`,
  sheetName: `data`,
  disabled: false,
  callback: () => {},
}

export default ExportToExcel
