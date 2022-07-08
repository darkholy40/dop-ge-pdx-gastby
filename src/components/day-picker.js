import React from "react"
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
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"

import renderTableDate from "../functions/render-table-date"

const months = [
  `มกราคม`, // (ม.ค.)
  `กุมภาพันธ์`, // (ก.พ.)
  `มีนาคม`, // (มี.ค.)
  `เมษายน`, // (เม.ย.)
  `พฤษภาคม`, // (พ.ค.)
  `มิถุนายน`, // (มิ.ย.)
  `กรกฎาคม`, // (ก.ค.)
  `สิงหาคม`, // (ส.ค.)
  `กันยายน`, // (ก.ย.)
  `ตุลาคม`, // (ต.ค.)
  `พฤศจิกายน`, // (พ.ย.)
  `ธันวาคม`, // (ธ.ค.)
]

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

const Head = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  .lt {
    width: 35%;
    min-width: 90px;
    margin-right: 8px;
  }

  .rt {
    width: 65%;
    min-width: 150px;
  }

  @media (max-width: 375px) {
    flex-direction: column;

    .lt {
      margin-bottom: 1rem;
    }

    .lt,
    .rt {
      width: 100%;
      min-width: auto;
    }
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  .top {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .btm {
    display: flex,
    justify-content: center,
    width: 100%,
  }
`

const MyDayPicker = ({
  selected,
  disabled,
  pickerProps,
  inputProps,
  onChange,
}) => {
  const title = inputProps !== undefined ? inputProps.label : `เลือกวันที่`
  const fromYear = pickerProps !== undefined ? pickerProps.fromYear : undefined
  const toYear = pickerProps !== undefined ? pickerProps.toYear : undefined
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
    const getDate = selected

    setSelectedDay(getDate)
    if (getDate !== null) {
      setCurrentMonth(getDate)
    }
  }, [selected])

  return (
    <>
      <TextField
        {...inputProps}
        onClick={() => {
          if (!disabled) {
            setOpen(true)
          }
        }}
        value={renderTableDate(selectedDay, `full-date`) || ``}
        disabled={disabled}
      />

      <Dialog
        // fullWidth
        maxWidth="xs"
        scroll="paper"
        open={open}
        onClose={cancelCloseModal}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent
          sx={{
            display: `flex`,
            flexDirection: `column`,
            userSelect: `none`,
          }}
        >
          <Head>
            <div className="lt">
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
            <div className="rt">
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
          </Head>
          <Content>
            <div className="top">
              <IconButton
                onClick={previousMonth}
                style={{ width: 40, height: 40 }}
                disabled={isSameMonth(navMinYear, currentMonth)}
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  style={{ fontSize: 20 }}
                />
              </IconButton>
              <IconButton
                onClick={nextMonth}
                style={{ width: 40, height: 40 }}
                disabled={isSameMonth(navMaxYear, currentMonth)}
              >
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={{ fontSize: 20 }}
                />
              </IconButton>
            </div>
            <div className="btm">
              <DayPicker
                {...pickerProps}
                style={{
                  margin: 0,
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
                  onChange(val)
                }}
                disabled={disabled}
              />
            </div>
          </Content>
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
  selected: PropTypes.object,
  disabled: PropTypes.bool,
  pickerProps: PropTypes.objectOf(PropTypes.any),
  inputProps: PropTypes.objectOf(PropTypes.any),
  onChange: PropTypes.func,
}

export default MyDayPicker
