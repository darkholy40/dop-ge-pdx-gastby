import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import StaticTags from "./static-tags"

const Main = styled.div`
  width: 100%;
  max-width: 1200px;
  min-height: calc(100vh - 204px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  color: rgb(0, 0, 0);
  border-radius: 3px;

  @media (max-width: 599px) {
    min-height: calc(100vh - 188px);
  }
`

const Layout = ({ children }) => {
  return (
    <Main>
      <StaticTags />
      {children}
    </Main>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
