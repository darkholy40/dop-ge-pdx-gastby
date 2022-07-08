import React from "react"
import { useSelector } from "react-redux"
import PropTypes from "prop-types"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import th from "date-fns/locale/th"
import { format, addMonths, isSameMonth } from "date-fns"

import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"

import renderTableDate from "../functions/render-table-date"

const months = [
  `มกราคม (ม.ค.)`,
  `กุมภาพันธ์ (ก.พ.)`,
  `มีนาคม (มี.ค.)`,
  `เมษายน (เม.ย.)`,
  `พฤษภาคม (พ.ค.)`,
  `มิถุนายน (มิ.ย.)`,
  `กรกฎาคม (ก.ค.)`,
  `สิงหาคม (ส.ค.)`,
  `กันยายน (ก.ย.)`,
  `ตุลาคม (ต.ค.)`,
  `พฤศจิกายน (พ.ย.)`,
  `ธันวาคม (ธ.ค.)`,
]

const rpdCellSize = 45

const formatCaption = (month, options) => {
  return (
    <>
      <span style={{ marginRight: 5 }}>
        {format(month, "LLLL", { locale: options.locale })}
      </span>
      <span>{new Date(month).getFullYear() + 543}</span>
    </>
  )
}

const MyDayPicker = props => {
  const fromYear =
    props.pickerProps !== undefined ? props.pickerProps.fromYear : undefined
  const toYear =
    props.pickerProps !== undefined ? props.pickerProps.toYear : undefined
  const { primaryColor } = useSelector(({ mainReducer }) => mainReducer)
  const [open, setOpen] = React.useState(false)
  const [years, setYears] = React.useState([])
  const [selectedDay, setSelectedDay] = React.useState(null)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [navMinYear, setNavMinYear] = React.useState(null)
  const [navMaxYear, setNavMaxYear] = React.useState(null)

  const cancelCloseModal = () => {
    setOpen(false)
    setCurrentMonth(selectedDay || new Date())
  }

  const previousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  React.useEffect(() => {
    let arr = []
    const forceMinYear = 1947
    const minYear =
      fromYear !== undefined && fromYear >= forceMinYear
        ? fromYear
        : forceMinYear
    const thisYear = toYear || new Date().getFullYear() + 10

    for (let i = 0; i <= thisYear - minYear; i++) {
      arr = [...arr, minYear + i]
    }

    setYears(arr)
    setNavMinYear(new Date(minYear, 0))
    setNavMaxYear(new Date(thisYear, 11))
  }, [fromYear, toYear])

  React.useEffect(() => {
    const getDate = props.selected

    setSelectedDay(getDate)
    if (getDate !== null) {
      setCurrentMonth(getDate)
    }
  }, [props.selected])

  const css = `
    :root {
      --rdp-cell-size: ${rpdCellSize}px;
      --rdp-accent-color: ${primaryColor[700]};
      --rdp-background-color: ${primaryColor[50]};
      --rdp-accent-color-dark: #3003e1;
      --rdp-background-color-dark: #180270;
      --rdp-outline: 2px solid var(--rdp-accent-color);
      --rdp-outline-selected: 2px solid ${primaryColor[900]};
    }
  `

  return (
    <>
      <style>{css}</style>
      <TextField
        {...props.inputProps}
        onClick={() => {
          if (!props.disabled) {
            setOpen(true)
          }
        }}
        value={renderTableDate(selectedDay, `full-date`) || ``}
        disabled={props.disabled}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        scroll="paper"
        open={open}
        onClose={cancelCloseModal}
        style={{ userSelect: `none` }}
      >
        <DialogTitle>{props.inputProps.label || ``}</DialogTitle>
        <DialogContent
          sx={{
            display: `flex`,
            flexDirection: `column`,
          }}
        >
          <div
            style={{
              display: `flex`,
              justifyContent: `center`,
              width: `100%`,
              marginTop: 8,
            }}
          >
            <div style={{ width: `35%`, marginRight: 8 }}>
              <Autocomplete
                sx={{ width: `100%` }}
                disablePortal
                options={years}
                noOptionsText={`ไม่พบข้อมูล`}
                getOptionLabel={option => `${option + 543}`}
                isOptionEqualToValue={(option, value) => {
                  return option === value
                }}
                disableClearable
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setCurrentMonth(
                      new Date(
                        newValue,
                        currentMonth.getMonth(),
                        currentMonth.getDate()
                      )
                    )
                  }
                }}
                value={new Date(currentMonth).getFullYear()}
                renderInput={params => (
                  <TextField
                    {...params}
                    size="small"
                    label="ปี (พ.ศ.)"
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        borderRadius: `5px`,
                      },
                    }}
                  />
                )}
              />
            </div>
            <div style={{ width: `65%` }}>
              <Autocomplete
                sx={{ width: `100%` }}
                disablePortal
                options={months}
                noOptionsText={`ไม่พบข้อมูล`}
                getOptionLabel={option => option}
                isOptionEqualToValue={(option, value) => {
                  return option === value
                }}
                disableClearable
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        months.findIndex(elem => elem === newValue),
                        currentMonth.getDate()
                      )
                    )
                  }
                }}
                value={months[new Date(currentMonth).getMonth()]}
                renderInput={params => (
                  <TextField
                    {...params}
                    size="small"
                    label="เดือน"
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        borderRadius: `5px`,
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div
            style={{
              display: `flex`,
              justifyContent: `space-between`,
              width: `100%`,
              maxWidth: rpdCellSize * 7,
              margin: `1rem auto 0.5rem auto`,
            }}
          >
            <IconButton
              onClick={previousMonth}
              style={{ width: 40, height: 40 }}
              disabled={isSameMonth(navMinYear, currentMonth)}
            >
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              onClick={nextMonth}
              style={{ width: 40, height: 40 }}
              disabled={isSameMonth(navMaxYear, currentMonth)}
            >
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 20 }} />
            </IconButton>
          </div>
          <div
            style={{
              display: `flex`,
              justifyContent: `center`,
              width: `100%`,
            }}
          >
            <DayPicker
              {...props.pickerProps}
              style={{
                margin: `0 0 1rem`,
              }}
              locale={th}
              mode="single"
              required
              month={currentMonth}
              disableNavigation
              formatters={{ formatCaption: formatCaption }}
              selected={selectedDay}
              onSelect={val => {
                setOpen(false)
                props.onChange(val)
              }}
              disabled={props.disabled}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ position: `absolute`, top: 0, right: 0 }}>
          <Tooltip arrow placement="bottom" title="ปิดหน้าต่าง">
            <IconButton
              style={{ width: 40, height: 40 }}
              onClick={cancelCloseModal}
            >
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </>
  )
}

MyDayPicker.propTypes = {
  pickerProps: PropTypes.objectOf(PropTypes.any),
  inputProps: PropTypes.objectOf(PropTypes.any),
  onChange: PropTypes.func,
}

export default MyDayPicker
