import React from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { createGlobalStyle } from "styled-components"
import { Backdrop, CircularProgress } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { green } from "@mui/material/colors"
// import AdapterDateFns from "@mui/lab/AdapterDateFns"
// import LocalizationProvider from "@mui/lab/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import thLocale from "date-fns/locale/th"

import Jwt from "./jwt"
import FirstMeetDialog from "./first-meet-dialog"
import NotificationDialog from "./notification-dialog"
import Footer from "./footer"
import ResponsiveDrawer from "./responsive-drawer"

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

  .MuiListItemButton-root {
    padding: 6px 12px;
    margin: 2px 6px;
    border-radius: 6px;

    &.Mui-selected {
      background-color: ${({ color }) => color[700]};
      color: #fff;
      transition: background-color 0.15s, color 0.15s;

      &:hover {
        background-color: ${({ color }) => color[800]};
      }

      svg {
        color: #fff;
        transition: color 0.15s;
      }
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

const Container = ({ children }) => {
  const { primaryColor, secondaryColor, backdropDialog } = useSelector(
    ({ mainReducer }) => mainReducer
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
        <Jwt />
        <FirstMeetDialog />
        <ResponsiveDrawer>
          <div>{children}</div>
          <Backdrop
            sx={{
              color: primaryColor[500],
              zIndex: theme => theme.zIndex.drawer + 1,
            }}
            open={backdropDialog.open}
          >
            <div
              style={{
                display: `flex`,
                alignItems: `center`,
                justifyContent: `center`,
                flexDirection: `column`,
                backgroundColor: `rgba(255, 255, 255, 0.8)`,
                padding: `2rem`,
                borderRadius: `1.5rem`,
                maxWidth: 360,
              }}
            >
              <CircularProgress color="inherit" size="5rem" thickness={5} />
              {backdropDialog.title !== `` && (
                <p
                  style={{
                    color: `#000`,
                    fontSize: `1.25rem`,
                    marginBottom: 0,
                    width: `100%`,
                    overflowX: `auto`,
                  }}
                >
                  {backdropDialog.title}
                </p>
              )}
            </div>
          </Backdrop>
        </ResponsiveDrawer>
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
