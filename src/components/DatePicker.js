import React, { useEffect, useState, forwardRef } from "react"
// import PropTypes from "prop-types"
import DatePicker from "react-datepicker"
import { TextField, IconButton } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"

import renderCheckingIcon from "../functions/renderCheckingIcon"

import "react-datepicker/dist/react-datepicker.css"

const months = {
  long: [
    `มกราคม`,
    `กุมภาพันธ์`,
    `มีนาคม`,
    `เมษายน`,
    `พฤษภาคม`,
    `มิถุนายน`,
    `กรกฎาคม`,
    `สิงหาคม`,
    `กันยายน`,
    `ตุลาคม`,
    `พฤศจิกายน`,
    `ธันวาคม`,
  ],
  short: [
    `ม.ค.`,
    `ก.พ.`,
    `มี.ค.`,
    `เม.ย.`,
    `พ.ค.`,
    `มิ.ย.`,
    `ก.ค.`,
    `ส.ค.`,
    `ก.ย.`,
    `ต.ค.`,
    `พ.ย.`,
    `ธ.ค.`,
  ],
}

const MyDatePicker = props => {
  const [years, setYears] = useState([])

  const renderMonths = (value, option) => {
    switch (option) {
      case `long`:
        return months.long[parseInt(value) - 1]

      default:
        return months.short[parseInt(value) - 1]
    }
  }

  const renderThaiText = value => {
    // 2022-06-23

    if (value !== ``) {
      const d = parseInt(value.split("-")[2])
      const m = parseInt(value.split("-")[1])
      const y = parseInt(value.split("-")[0])

      return `${d} ${renderMonths(m, `long`)} ${y + 543}`
    }

    return ``
  }

  const getYear = value => {
    return value.getFullYear()
  }

  const getMonth = value => {
    return value.getMonth()
  }

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <TextField
      sx={{ width: `100%`, cursor: `pointer` }}
      label={props.label}
      InputProps={{
        readOnly: true,
        endAdornment: renderCheckingIcon(
          props.value === null ? `` : props.value
        ),
      }}
      value={renderThaiText(value)}
      onClick={onClick}
      ref={ref}
    />
  ))

  useEffect(() => {
    let arr = []
    const minYear = 1907

    for (let i = 0; i < new Date().getFullYear() - minYear + 10; i++) {
      arr = [...arr, minYear + i]
    }

    setYears(arr)
  }, [])

  return (
    <DatePicker
      {...props}
      withPortal
      selected={props.value}
      onChange={props.onChange}
      customInput={<CustomInput />}
      dateFormat="yyyy-MM-dd"
      // todayButton="วันนี้"
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div
          style={{
            margin: 10,
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
          }}
        >
          <IconButton
            style={{
              width: 25,
              height: 25,
            }}
            onClick={e => {
              e.preventDefault()
              decreaseMonth()
            }}
            disabled={prevMonthButtonDisabled}
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              style={{ fontSize: `1rem` }}
            />
          </IconButton>

          <select
            value={getYear(date)}
            onChange={({ target: { value } }) => changeYear(value)}
          >
            {years.map(option => (
              <option key={option} value={option}>
                {option + 543}
              </option>
            ))}
          </select>

          <select
            value={months.long[getMonth(date)]}
            onChange={({ target: { value } }) =>
              changeMonth(months.long.indexOf(value))
            }
          >
            {months.long.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <IconButton
            style={{
              width: 25,
              height: 25,
            }}
            onClick={e => {
              e.preventDefault()
              increaseMonth()
            }}
            disabled={nextMonthButtonDisabled}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{ fontSize: `1rem` }}
            />
          </IconButton>
        </div>
      )}
    />
  )
}

// MyDatePicker.propTypes = {
//   children: PropTypes.node.isRequired,
// }

export default MyDatePicker
