import React, { useEffect, useState } from "react"
import { useStaticQuery, graphql, navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBars,
  faUserAlt,
  faCog,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons"
import styled from "styled-components"

import { client, gql } from "../functions/apollo-client"

import { ColorButton } from "./styles"

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  div {
    padding: 4px 16px;
    margin-right: 4px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: ${({ primaryColor }) => primaryColor[800]};
    }

    &.active {
      background-color: ${({ primaryColor }) => primaryColor[900]};
      color: ${({ primaryColor }) => primaryColor[100]};
    }
  }

  @media (max-width: 599px) {
    display: none;
  }
`

const SessionTimer = styled.div`
  position: absolute;
  top: 3.5rem;
  right: 1.5rem;
  color: #000;
  padding: 5px 10px;
  border-radius: 8px;
  box-shadow: rgb(0 0 0 / 10%) 0px 10px 24px;
  opacity: 0;
  transition: 0.75s ease-in;

  &.active {
    opacity: 0.25;

    @media (hover: hover) {
      &:hover {
        background-color: #fff;
        transition: 0.025s ease-in;
        opacity: 1;
      }
    }
  }

  > span.l {
    margin-right: 5px;
  }

  @media (max-width: 599px) {
    display: flex;
    flex-direction: column;

    > span {
      &.l {
        font-size: 0.5rem;
      }

      font-size: 0.75rem;
    }
  }
`

const Navbar = () => {
  const dispatch = useDispatch()
  const { currentPage, token, userInfo, primaryColor, sessionTimer } =
    useSelector(state => state)
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
  const [anchorElMenu, setAnchorElMenu] = useState(null)
  const [anchorElMyInfo, setAnchorElMyInfo] = useState(null)
  const [sessionTimerClassname, setSessionTimerClassname] = useState(``)

  const pages = [
    {
      name: `people`,
      desc: `ประวัติกำลังพล`,
      role: ``,
    },
    {
      name: `positions`,
      desc: `คลังตำแหน่ง`,
      role: ``,
    },
    {
      name: `reports`,
      desc: `ออกรายงาน`,
      role: `administrator`,
    },
    {
      name: `user-management`,
      desc: `จัดการผู้ใช้งาน`,
      role: `super administrator`,
    },
    {
      name: `activities`,
      desc: `ประวัติการใช้งานระบบ`,
      role: `super administrator`,
    },
  ]

  const changePage = getPage => {
    if (getPage !== currentPage) {
      if (getPage === `home`) {
        navigate(`/`)
      } else {
        navigate(`/${getPage}/`)
      }
    }
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

  const displaySessionTimer = () => {
    if (parseInt(sessionTimer.hr) > 0) {
      return `${parseInt(sessionTimer.hr)} ชม. ${parseInt(
        sessionTimer.min
      )} นาที`
    }

    if (parseInt(sessionTimer.min) > 0) {
      return `${parseInt(sessionTimer.min)} นาที ${parseInt(
        sessionTimer.sec
      )} วินาที`
    }

    return `${parseInt(sessionTimer.sec)} วินาที`
  }

  useEffect(() => {
    if (token !== ``) {
      setSessionTimerClassname(`active`)
    } else {
      setSessionTimerClassname(``)
    }
  }, [token])

  return (
    <AppBar>
      <Toolbar variant="dense">
        {token !== `` && (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, display: { sm: `none` } }}
              onClick={event => {
                setAnchorElMenu(event.currentTarget)
              }}
            >
              <FontAwesomeIcon icon={faBars} style={{ fontSize: 20 }} />
            </IconButton>
            <Menu
              sx={{
                ".MuiList-root.MuiList-padding.MuiMenu-list": {
                  minWidth: 180,
                },
              }}
              anchorEl={anchorElMenu}
              open={Boolean(anchorElMenu)}
              onClose={() => {
                setAnchorElMenu(null)
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <ColorButton primaryColor={primaryColor}>
                <div className="row">
                  <p style={{ margin: `8px 8px 16px` }}>
                    {site.siteMetadata.title}
                  </p>
                  {pages.map((page, pageIndex) => {
                    const menuList = () => (
                      <div
                        key={`page_m_${pageIndex}`}
                        role="presentation"
                        className={
                          currentPage === `${page.name}` ? `active` : ``
                        }
                        onClick={() => {
                          changePage(`${page.name}`)
                          setAnchorElMenu(null)
                        }}
                      >
                        {page.desc}
                      </div>
                    )

                    switch (userInfo.role.name) {
                      case `Super Administrator`:
                        if (page.role === `super administrator`) {
                          return menuList()
                        }
                        return ``

                      case `Administrator`:
                        if (page.role === `administrator` || page.role === ``) {
                          return menuList()
                        }
                        return ``

                      default:
                        if (page.role === ``) {
                          return menuList()
                        }
                        return ``
                    }
                  })}
                </div>
              </ColorButton>
            </Menu>
          </>
        )}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Flex primaryColor={primaryColor}>
            <p style={{ margin: 0, padding: `4px 16px` }}>
              {site.siteMetadata.title}
            </p>
            {token !== `` && (
              <>
                {pages.map((page, pageIndex) => {
                  const menuList = () => (
                    <div
                      key={`page_${pageIndex}`}
                      role="presentation"
                      className={currentPage === `${page.name}` ? `active` : ``}
                      onClick={() => changePage(`${page.name}`)}
                    >
                      {page.desc}
                    </div>
                  )

                  switch (userInfo.role.name) {
                    case `Super Administrator`:
                      if (page.role === `super administrator`) {
                        return menuList()
                      }
                      return ``

                    case `Administrator`:
                      if (page.role === `administrator` || page.role === ``) {
                        return menuList()
                      }
                      return ``

                    default:
                      if (page.role === ``) {
                        return menuList()
                      }
                      return ``
                  }
                })}
              </>
            )}
          </Flex>
        </Typography>
        {token !== `` && (
          <>
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
            <SessionTimer className={sessionTimerClassname}>
              <span className="l">เซสชันคงเหลือ</span>
              <span className="r">{displaySessionTimer()}</span>
            </SessionTimer>

            <Menu
              sx={{
                ".MuiList-root.MuiList-padding.MuiMenu-list": {
                  minWidth: 180,
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
              <MenuItem
                onClick={() => {
                  setAnchorElMyInfo(null)
                  navigate(`/setting/`)
                }}
                disableRipple
              >
                <FontAwesomeIcon
                  icon={faCog}
                  style={{ fontSize: 20, marginRight: 5 }}
                />
                ตั้งค่า
              </MenuItem>
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
  )
}

export default Navbar
