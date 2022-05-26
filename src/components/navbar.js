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

    &:hover {
      background-color: #fff;
      transition: 0.025s ease-in;
      opacity: 1;
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
    },
    {
      name: `positions`,
      desc: `คลังตำแหน่ง`,
    },
    {
      name: `reports`,
      desc: `ออกรายงาน`,
      role: `administrator`,
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

  const goLogout = () => {
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

    navigate(`/`)
  }

  const displaySessionTimer = () => {
    if (sessionTimer.hr > 0) {
      return `${sessionTimer.hr} ชม. ${sessionTimer.min} นาที`
    }

    return `${sessionTimer.min}:${sessionTimer.sec} นาที`
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

                    if (userInfo.role.name !== `Administrator`) {
                      if (page.role !== `administrator`) {
                        return menuList()
                      }
                      return null
                    } else {
                      return menuList()
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

                  if (userInfo.role.name !== `Administrator`) {
                    if (page.role !== `administrator`) {
                      return menuList()
                    }
                    return null
                  } else {
                    return menuList()
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
              เซสชันคงเหลือ {displaySessionTimer()}
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
