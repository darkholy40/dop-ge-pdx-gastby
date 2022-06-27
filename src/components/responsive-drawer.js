import * as React from "react"
import { useStaticQuery, graphql, navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import PropTypes from "prop-types"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { Button, Menu, MenuItem } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBars,
  faUsers,
  faPoll,
  faPrint,
  faUsersCog,
  faRunning,
  faUserAlt,
  faCog,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../functions/apollo-client"

import roles from "../static/roles"

const drawerWidth = 240

const ResponsiveDrawer = props => {
  const { window, children } = props
  const dispatch = useDispatch()
  const { currentPage, token, userInfo, tutorialCount, primaryColor } =
    useSelector(({ mainReducer }) => mainReducer)
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [anchorElMyInfo, setAnchorElMyInfo] = React.useState(null)

  const pages = {
    authenticated: [
      {
        name: `people`,
        desc: `ประวัติกำลังพล`,
        icon: faUsers,
        role: roles.Authenticated,
      },
      {
        name: `positions`,
        desc: `คลังตำแหน่ง`,
        icon: faPoll,
        role: roles.Authenticated,
      },
    ],
    administrator: [
      {
        name: `reports`,
        desc: `ออกรายงาน`,
        icon: faPrint,
        role: roles.Administrator,
      },
    ],
    superAdministrator: [
      {
        name: `user-management`,
        desc: `จัดการผู้ใช้งาน`,
        icon: faUsersCog,
        role: roles.SuperAdministrator,
      },
      {
        name: `activities`,
        desc: `ประวัติการใช้งานระบบ`,
        icon: faRunning,
        role: roles.SuperAdministrator,
      },
    ],
    all: [
      {
        name: `settings`,
        desc: `การตั้งค่า`,
        icon: faCog,
        role: roles.Authenticated,
      },
    ],
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const changePage = getPage => {
    // if (getPage !== currentPage) {
    setMobileOpen(false)
    if (getPage === `home`) {
      navigate(`/`)
    } else {
      navigate(`/${getPage}/`)
    }
    // }
  }

  const goLogout = async () => {
    const clearSession = async () => {
      dispatch({
        type: `SET_TOKEN`,
        token: ``,
      })

      dispatch({
        type: `SET_SESSION_TIMER`,
        sessionTimer: {
          hr: `08`,
          min: `00`,
          sec: `00`,
        },
      })
    }

    await clearSession()
    await navigate(`/`)

    try {
      await client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "auth",
                description: "logout",
                users_permissions_user: "${userInfo._id}",
              }
            }) {
              log {
                _id
              }
            }
          }
        `,
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  const drawer = (
    <div>
      <Toolbar />
      {roles[userInfo.role.name].level >= 1 && (
        <>
          <Divider />
          <List>
            {pages.authenticated.map((page, pageIndex) => {
              return (
                <ListItem key={`menu_${pageIndex}`} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      changePage(`${page.name}`)
                    }}
                    selected={currentPage === `${page.name}`}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={page.icon} />
                    </ListItemIcon>
                    <ListItemText primary={page.desc} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </>
      )}
      {roles[userInfo.role.name].level >= 2 && (
        <>
          <Divider />
          <List>
            {pages.administrator.map((page, pageIndex) => {
              return (
                <ListItem key={`menu_${pageIndex}`} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      changePage(`${page.name}`)
                    }}
                    selected={currentPage === `${page.name}`}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={page.icon} />
                    </ListItemIcon>
                    <ListItemText primary={page.desc} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </>
      )}
      {roles[userInfo.role.name].level >= 3 && (
        <>
          <Divider />
          <List>
            {pages.superAdministrator.map((page, pageIndex) => {
              return (
                <ListItem key={`menu_${pageIndex}`} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      changePage(`${page.name}`)
                    }}
                    selected={currentPage === `${page.name}`}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={page.icon} />
                    </ListItemIcon>
                    <ListItemText primary={page.desc} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </>
      )}
      {roles[userInfo.role.name].level >= 1 && (
        <>
          <Divider />
          <List>
            {pages.all.map((page, pageIndex) => {
              return (
                <ListItem key={`menu_${pageIndex}`} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      changePage(`${page.name}`)
                    }}
                    selected={
                      currentPage === `settings` ||
                      currentPage === `settings-general` ||
                      currentPage === `settings-system-data`
                    }
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={page.icon} />
                    </ListItemIcon>
                    <ListItemText primary={page.desc} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </>
      )}
    </div>
  )

  const container =
    window !== undefined ? () => window().document.body : undefined

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: {
            md:
              token !== `` && tutorialCount === 4
                ? `calc(100% - ${drawerWidth}px)`
                : `100%`,
          },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: primaryColor[500],
        }}
      >
        <Toolbar sx={{ justifyContent: `space-between` }}>
          {token !== `` && (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <FontAwesomeIcon icon={faBars} />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { md: "block", xs: "none" } }}
              >
                {site.siteMetadata.title}
              </Typography>
              <Button
                color="inherit"
                onClick={event => {
                  setAnchorElMyInfo(event.currentTarget)
                }}
              >
                <FontAwesomeIcon
                  icon={faUserAlt}
                  style={{ fontSize: 20, marginRight: 5 }}
                />
                <span>{userInfo.name}</span>
              </Button>
              {/* <SessionTimer /> */}

              <Menu
                sx={{
                  ".MuiList-root.MuiList-padding.MuiMenu-list": {
                    minWidth: 200,
                  },
                }}
                anchorEl={anchorElMyInfo}
                open={Boolean(anchorElMyInfo)}
                onClose={() => {
                  setAnchorElMyInfo(null)
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {tutorialCount === 4 && (
                  <MenuItem
                    onClick={() => {
                      setAnchorElMyInfo(null)
                      navigate(`/settings/`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon
                      icon={faCog}
                      style={{ fontSize: 20, marginRight: 5 }}
                    />
                    การตั้งค่า
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setAnchorElMyInfo(null)
                    goLogout()
                  }}
                  disableRipple
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    style={{ fontSize: 20, marginRight: 5 }}
                  />
                  ออกจากระบบ
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      {token !== `` && tutorialCount === 4 && (
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
          aria-label="mailbox folders"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            md:
              token !== `` && tutorialCount === 4
                ? `calc(100% - ${drawerWidth}px)`
                : `100%`,
            xs: `100%`,
          },
          fontFamily: `var(--main-font-family)`,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
  children: PropTypes.node.isRequired,
}

export default ResponsiveDrawer
