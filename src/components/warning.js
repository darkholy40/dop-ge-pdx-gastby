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
  padding: 1.5rem 0;
  border-radius: 24px;
  box-shadow: rgb(0 0 0 / 10%) 0px 2px 4px, rgb(0 0 0 / 10%) 0px 8px 16px;
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
