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
  Popover,
  MenuItem,
  Badge,
  Tooltip,
  Collapse,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBars,
  faUsers,
  faPoll,
  faPrint,
  faUsersCog,
  faRunning,
  faDatabase,
  faUserAlt,
  faCog,
  faSignOutAlt,
  faSync,
  faServer,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../functions/apollo-client"

import SessionTimer from "./session-timer"
import renderFullname from "../functions/render-fullname"
import roleLevel from "../functions/role-level"

const drawerWidth = 240

const MainContent = props => {
  const { window, children } = props
  const dispatch = useDispatch()
  const { currentPage, token, userInfo, tutorialCount, primaryColor } =
    useSelector(({ mainReducer }) => mainReducer)
  const { shouldUpdateStatic } = useSelector(
    ({ staticReducer }) => staticReducer
  )
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
        level: 1,
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
    databaseManagement: [
      {
        name: `databases`,
        desc: `การจัดการฐานข้อมูล`,
        icon: faDatabase,
        level: 2,
      },
    ],
    serverConfigs: [
      {
        name: `server-configs`,
        desc: `การตั้งค่า Server`,
        icon: faServer,
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
      {pages.authenticated.filter(
        elem => elem.level <= roleLevel(userInfo.role)
      ).length > 0 && (
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
              ) : (
                ``
              )
            })}
          </List>
        </>
      )}
      {pages.report.filter(elem => elem.level <= roleLevel(userInfo.role))
        .length > 0 && (
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
              ) : (
                ``
              )
            })}
          </List>
        </>
      )}
      {pages.userManagement.filter(
        elem => elem.level <= roleLevel(userInfo.role)
      ).length > 0 && (
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
              ) : (
                ``
              )
            })}
          </List>
        </>
      )}
      {pages.databaseManagement.filter(
        elem => elem.level <= roleLevel(userInfo.role)
      ).length > 0 && (
        <>
          <Divider />
          <List>
            {pages.databaseManagement.map((page, pageIndex) => {
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
              ) : (
                ``
              )
            })}
          </List>
        </>
      )}
      {pages.serverConfigs.filter(
        elem => elem.level <= roleLevel(userInfo.role)
      ).length > 0 && (
        <>
          <Divider />
          <List>
            {pages.serverConfigs.map((page, pageIndex) => {
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
              ) : (
                ``
              )
            })}
          </List>
        </>
      )}
      {pages.controlPanel.filter(elem => elem.level <= roleLevel(userInfo.role))
        .length > 0 && (
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
                      currentPage === `settings-system-data` ||
                      currentPage === `settings-unit`
                    }
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={page.icon} />
                    </ListItemIcon>
                    <ListItemText primary={page.desc} />
                  </ListItemButton>
                </ListItem>
              ) : (
                ``
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
              <div style={{ display: `flex` }}>
                {tutorialCount === 4 && (
                  <Collapse
                    in={shouldUpdateStatic.length > 0}
                    orientation="horizontal"
                  >
                    <Tooltip
                      arrow
                      placement="bottom"
                      title={`พบการอัปเดตข้อมูลระบบ ${shouldUpdateStatic.length} รายการ`}
                    >
                      <IconButton
                        color="inherit"
                        style={{
                          width: 40,
                          height: 40,
                          marginRight: 5,
                        }}
                        onClick={() => navigate(`/settings/system-data/`)}
                      >
                        <Badge
                          badgeContent={shouldUpdateStatic.length}
                          color="error"
                        >
                          <FontAwesomeIcon
                            icon={faSync}
                            style={{ fontSize: 20 }}
                          />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </Collapse>
                )}

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
                    {renderFullname({
                      rank: userInfo.rank,
                      name: userInfo.name,
                    })}
                  </span>
                </Button>
              </div>

              <Popover
                sx={{
                  ".MuiPaper-root.MuiPaper-elevation": {
                    minWidth: `240px`,
                    padding: `4px 0`,
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
                  <>
                    <MenuItem
                      onClick={() => {
                        setAnchorElMyInfo(null)
                        navigate(`/settings/general/`)
                      }}
                      disableRipple
                    >
                      <div
                        style={{
                          display: `flex`,
                          flexDirection: `column`,
                        }}
                      >
                        <span style={{ margin: `0.25rem 0` }}>
                          {renderFullname(userInfo)}
                        </span>
                        <span
                          style={{ margin: `0.25rem 0`, fontSize: `0.75rem` }}
                        >
                          <FontAwesomeIcon
                            icon={faUserAlt}
                            style={{ fontSize: 14, marginRight: 5 }}
                          />
                          {userInfo.username}
                        </span>
                      </div>
                    </MenuItem>
                    <Divider style={{ margin: `6px 18px` }} />
                  </>
                )}
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
              </Popover>
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

MainContent.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
  children: PropTypes.node.isRequired,
}

export default MainContent
