import React from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import styled from "styled-components"
import { Backdrop, CircularProgress } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import {
  green as primaryColor,
  amber as secondaryColor,
} from "@mui/material/colors"

import Navbar from "./Navbar"
import Footer from "./Footer"

const MainContainer = styled.div`
  width: 100%;
  margin-left: auto;

  @media (max-width: 599px) {
    transition: 0.3s;
  }
`

const Row = styled.div`
  padding: 4rem 1rem 0 1rem;
`

const Container = ({ children }) => {
  const { backdropOpen } = useSelector(state => state)
  const muiTheme = createTheme({
    palette: {
      type: "light",
      primary: {
        main: primaryColor[500], // green
      },
      secondary: {
        main: secondaryColor[500], // amber
      },
    },
  })

  return (
    <ThemeProvider theme={muiTheme}>
      <Navbar />
      <MainContainer>
        <Row>{children}</Row>
        <Backdrop
          sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
          open={backdropOpen}
        >
          <CircularProgress color="inherit" size="4rem" />
        </Backdrop>
      </MainContainer>
      <Footer />
    </ThemeProvider>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Container
