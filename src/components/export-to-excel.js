import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import * as XLSX from "xlsx-js-style"
import { Button, Collapse } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheck,
  faFileArrowDown,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons"
import { blue, green } from "@mui/material/colors"

const ExportToExcel = ({
  apiData,
  wsConfigs,
  fileName,
  sheetName,
  disabled,
  callback,
  fileIsDownloaded,
}) => {
  const [isFinish, setIsFinish] = useState(false)
  const fileExtension = `.xlsx`

  const exportToCSV = useCallback(
    (apiData, fileName) => {
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
    },
    [fileExtension, sheetName, wsConfigs]
  )

  useEffect(() => {
    const goDownloadCSV = setTimeout(() => {
      if (fileIsDownloaded && !isFinish) {
        exportToCSV(apiData, fileName)
        setIsFinish(true)
      }
    }, 500)

    return () => {
      clearTimeout(goDownloadCSV)
    }
  }, [exportToCSV, apiData, fileName, fileIsDownloaded, isFinish])

  useEffect(() => {
    setIsFinish(false)
  }, [apiData])

  return (
    <>
      <Collapse in={!fileIsDownloaded}>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => {
            callback()
          }}
          disabled={disabled}
        >
          <FontAwesomeIcon
            icon={faFileExcel}
            style={{ marginRight: 8, fontSize: 22 }}
          />
          <span>ดาวน์โหลดไฟล์ .xlsx</span>
        </Button>
      </Collapse>
      <Collapse in={fileIsDownloaded}>
        <div
          style={{
            display: `flex`,
            justifyContent: `center`,
            alignContent: `center`,
            padding: `6px 16px`,
            borderRadius: `4px`,
            color: !isFinish ? blue[500] : green[500],
            userSelect: `none`,
            transition: `color 0.3s`,
          }}
        >
          <FontAwesomeIcon
            icon={!isFinish ? faFileArrowDown : faCheck}
            style={{ marginRight: 8, fontSize: 22 }}
          />
          <span>{!isFinish ? `กำลังดาวน์โหลด...` : `ดาวน์โหลดแล้ว`}</span>
        </div>
      </Collapse>
    </>
  )
}

ExportToExcel.propTypes = {
  apiData: PropTypes.array.isRequired,
  wsConfigs: PropTypes.array,
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
  disabled: PropTypes.bool,
  callback: PropTypes.func,
  fileIsDownloaded: PropTypes.bool,
}

ExportToExcel.defaultProps = {
  wsConfigs: [],
  fileName: `myfile`,
  sheetName: `data`,
  disabled: false,
  callback: () => {},
  fileIsDownloaded: false,
}

export default ExportToExcel
