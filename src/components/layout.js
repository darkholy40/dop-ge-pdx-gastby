import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

const Main = styled.div`
  width: 100%;
  max-width: 1200px;
  min-height: calc(100vh - 196px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  color: rgb(0, 0, 0);
  border-radius: 3px;

  @media (max-width: 599px) {
    min-height: calc(100vh - 212px);
  }
`

const Layout = ({ children }) => {
  return <Main>{children}</Main>
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
