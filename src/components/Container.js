import React from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import styled, { createGlobalStyle } from "styled-components"
import { Backdrop, CircularProgress } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import thLocale from "date-fns/locale/th"

import Navbar from "./Navbar"
import StaticData from "./StaticData"
import NotificationDialog from "./NotificationDialog"
import Footer from "./Footer"

const GlobalStyles = createGlobalStyle`
  a {
    color: ${({ color }) => color[700]};
    transition: color 0.2s;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    &:active {
      color: ${({ color }) => color[300]};
    }
  }
`

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
  const { primaryColor, secondaryColor, backdropOpen } = useSelector(
    state => state
  )
  const muiTheme = createTheme({
    palette: {
      type: `light`,
      primary: {
        main: primaryColor[500],
      },
      secondary: {
        main: secondaryColor[500],
      },
    },
  })

  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={thLocale}>
        <GlobalStyles color={primaryColor} />
        <Navbar />
        <StaticData />
        <MainContainer>
          <Row>{children}</Row>
          <Backdrop
            sx={{
              color: primaryColor[200],
              zIndex: theme => theme.zIndex.drawer + 1,
            }}
            open={backdropOpen}
          >
            <CircularProgress color="inherit" size="4rem" />
          </Backdrop>
        </MainContainer>
        <NotificationDialog />
        <Footer />
      </LocalizationProvider>
    </ThemeProvider>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Container
