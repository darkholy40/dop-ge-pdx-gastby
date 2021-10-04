import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import Header from "./Header"
import Footer from "./Footer"

const MainContainer = styled.div`
  width: 100%;
  margin-left: auto;

  @media (max-width: 599px) {
    transition: 0.3s;
  }
`

const Row = styled.div`
  padding: 3rem 1rem 0 1rem;
`

const Container = ({ children }) => {
  return (
    <>
      <Header />
      <MainContainer>
        <Row>{children}</Row>
      </MainContainer>
      <Footer />
    </>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Container
