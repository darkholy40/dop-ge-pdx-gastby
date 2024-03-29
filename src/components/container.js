import React from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { createGlobalStyle } from "styled-components"
import { Backdrop, CircularProgress } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { green } from "@mui/material/colors"

import Jwt from "./jwt"
import FirstMeetDialog from "./first-meet-dialog"
import StaticTags from "./static-tags"
import MainContent from "./main-content"
import NotificationDialog from "./notification-dialog"
import Footer from "./footer"

const GlobalStyles = createGlobalStyle`
  ::selection {
    background-color: ${({ color }) => color[700]};
    color: #fff;
  }

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

  .rdp {
    --rdp-cell-size: 45px;
    --rdp-accent-color: ${({ color }) => color[500]};
    --rdp-background-color: ${({ color }) => color[50]};
    --rdp-outline: 2px solid var(--rdp-accent-color);
    --rdp-outline-selected: 2px solid ${({ color }) => color[900]};
  }

  .MuiButtonBase-root {
    &.MuiMenuItem-root,
    &.MuiListItemButton-root {
      padding: 6px 12px;
      margin: 3px 6px;
      border-radius: 4px;
  
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
  }

  @media (max-width: 599px) {
    .rdp {
      --rdp-cell-size: 40px;
    }
  }
`

const Container = ({ children }) => {
  const { primaryColor, secondaryColor, backdropDialog } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const muiTheme = createTheme({
    palette: {
      mode: `light`,
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
    typography: {
      fontFamily: `var(--main-font-family)`,
    },
    components: {
      MuiAlert: {
        styleOverrides: {
          standard: {
            borderRadius: `5px`,
          },
          outlined: {
            borderRadius: `8px`,
          },
          filled: {
            borderRadius: `8px`,
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            paddingTop: `4px`,
            paddingBottom: `4px`,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: `42px`,
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={muiTheme}>
      <GlobalStyles color={primaryColor} />
      <Jwt />
      <FirstMeetDialog />
      <StaticTags />
      <MainContent>{children}</MainContent>
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
            backgroundColor: `rgba(255, 255, 255, 0.95)`,
            padding: `2rem`,
            borderRadius: `1.5rem`,
            maxWidth: 360,
          }}
        >
          <CircularProgress color="inherit" size="5rem" thickness={6} />
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
      <NotificationDialog />
      <Footer />
    </ThemeProvider>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Container
