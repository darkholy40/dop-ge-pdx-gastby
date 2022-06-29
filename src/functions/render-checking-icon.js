import React from "react"
import { InputAdornment } from "@mui/material"
import { green, red } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheckCircle as faFilledCheckCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"

const renderCheckingIcon = value => {
  switch (value) {
    case ``:
    case false:
    case null:
    case undefined:
      return (
        <InputAdornment position="end">
          <FontAwesomeIcon icon={faCheckCircle} />
        </InputAdornment>
      )

    case `warning`:
      return (
        <InputAdornment position="end">
          <FontAwesomeIcon icon={faInfoCircle} style={{ color: red[500] }} />
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
