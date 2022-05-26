import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import { red, grey } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExclamationTriangle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons"

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`

const Warning = ({ text, button, variant }) => {
  const renderTheme = (value, text) => {
    switch (value) {
      case `notfound`:
        return (
          <>
            <FontAwesomeIcon
              icon={faSearch}
              style={{ fontSize: `5rem`, color: grey[500] }}
            />
            <p style={{ color: grey[500] }}>{text}</p>
          </>
        )

      default:
        return (
          <>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              style={{ fontSize: `5rem`, color: red[500] }}
            />
            <p style={{ color: red[500] }}>{text}</p>
          </>
        )
    }
  }

  return (
    <Flex>
      {renderTheme(variant, text)}
      {button}
    </Flex>
  )
}

Warning.propTypes = {
  text: PropTypes.string,
  button: PropTypes.node,
  variant: PropTypes.string,
}

Warning.defaultProps = {
  text: ``,
  button: <></>,
  variant: ``,
}

export default Warning
