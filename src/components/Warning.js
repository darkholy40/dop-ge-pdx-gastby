import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import { red } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`

const Warning = ({ text, button }) => {
  return (
    <Flex>
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        style={{ fontSize: `5rem`, color: red[500] }}
      />
      <p style={{ color: red[500] }}>{text}</p>
      {button}
    </Flex>
  )
}

Warning.propTypes = {
  text: PropTypes.string,
  button: PropTypes.node,
}

Warning.defaultProps = {
  text: ``,
  button: <></>,
}

export default Warning
