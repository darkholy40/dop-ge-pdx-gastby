import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

const Main = styled.main`
  width: 100%;
  max-width: 1024px;
  min-height: calc(100vh - 172px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  padding: 0.5rem 0;
  color: rgb(0, 0, 0);
  border-radius: 3px;

  @media (max-width: 599px) {
    min-height: calc(100vh - 164px);
  }
`

const Layout = ({ children }) => {
  return <Main>{children}</Main>
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
