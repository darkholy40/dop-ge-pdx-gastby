import React from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import styled, { createGlobalStyle } from "styled-components"
import { Backdrop, CircularProgress } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { green } from "@mui/material/colors"
// import AdapterDateFns from "@mui/lab/AdapterDateFns"
// import LocalizationProvider from "@mui/lab/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
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

  .react-datepicker__portal {
    background-color: rgba(0, 0, 0, 0.5);

    .react-datepicker {
      box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
    }
  }

  .react-datepicker__today-button {
    padding: 8px 0;
    transition: 0.3s;

    &:hover {
      background-color: #ddd;
      transition: 0.1s;
    }

    &:active {
      background-color: #ccc;
      transition: 0.1s;
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
      success: {
        main: green[600],
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
            <CircularProgress color="inherit" size="5rem" thickness={5} />
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
