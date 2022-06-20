import React from "react"
import { InputAdornment } from "@mui/material"
import { green } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle as faFilledCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"

const renderCheckingIcon = value => {
  switch (value) {
    case ``:
    case null:
    case undefined:
      return (
        <InputAdornment position="end">
          <FontAwesomeIcon icon={faCheckCircle} />
        </InputAdornment>
      )

    default:
      return (
        <InputAdornment position="end">
          <FontAwesomeIcon
            icon={faFilledCheckCircle}
            style={{ color: green[500] }}
          />
        </InputAdornment>
      )
  }
}

export default renderCheckingIcon
