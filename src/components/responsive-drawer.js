import * as React from "react"
import { useStaticQuery, graphql, navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import PropTypes from "prop-types"
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material"
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

import SessionTimer from "./session-timer"
import renderFullname from "../functions/render-fullname"
import roleLevel from "../functions/roleLevel"

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
        level: 1,
      },
      {
        name: `positions`,
        desc: `คลังตำแหน่ง`,
        icon: faPoll,
        level: 1,
      },
    ],
    report: [
      {
        name: `reports`,
        desc: `การออกรายงาน`,
        icon: faPrint,
        level: 2,
      },
    ],
    userManagement: [
      {
        name: `users`,
        desc: `ผู้ใช้งานระบบ`,
        icon: faUsersCog,
        level: 2,
      },
      {
        name: `activities`,
        desc: `ประวัติการใช้งานระบบ`,
        icon: faRunning,
        level: 3,
      },
    ],
    controlPanel: [
      {
        name: `settings`,
        desc: `การตั้งค่า`,
        icon: faCog,
        level: 1,
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
        type: `RESET_SESSION_TIMER`,
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
      <Toolbar sx={{ position: `relative` }}>
        <SessionTimer />
      </Toolbar>
      {pages.authenticated.filter(elem => elem.level <= roleLevel(userInfo.role)).length > 0 && (
        <>
          <Divider />
          <List>
            {pages.authenticated.map((page, pageIndex) => {
              return page.level <= roleLevel(userInfo.role) ? (
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
              ) : ``
            })}
          </List>
        </>
      )}
      {pages.report.filter(elem => elem.level <= roleLevel(userInfo.role)).length > 0 && (
        <>
          <Divider />
          <List>
            {pages.report.map((page, pageIndex) => {
              return page.level <= roleLevel(userInfo.role) ? (
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
              ) : ``
            })}
          </List>
        </>
      )}
      {pages.userManagement.filter(elem => elem.level <= roleLevel(userInfo.role)).length > 0 && (
        <>
          <Divider />
          <List>
            {pages.userManagement.map((page, pageIndex) => {
              return page.level <= roleLevel(userInfo.role) ? (
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
              ) : ``
            })}
          </List>
        </>
      )}
      {pages.controlPanel.filter(elem => elem.level <= roleLevel(userInfo.role)).length > 0 && (
        <>
          <Divider />
          <List>
            {pages.controlPanel.map((page, pageIndex) => {
              return page.level <= roleLevel(userInfo.role) ? (
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
              ) : ``
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
              token !== `` && tutorialCount === 4 && currentPage !== `home`
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
                <span>
                  {renderFullname({ rank: userInfo.rank, name: userInfo.name })}
                </span>
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
      {token !== `` && tutorialCount === 4 && currentPage !== `home` && (
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
              token !== `` && tutorialCount === 4 && currentPage !== `home`
                ? `calc(100% - ${drawerWidth}px)`
                : `100%`,
            xs: `100%`,
          },
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
