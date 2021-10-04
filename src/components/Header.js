import React from "react"
import { useStaticQuery, graphql, navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { AppBar, Toolbar, Button, IconButton, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons"
import { blue } from "@mui/material/colors"

import styled from "styled-components"

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  div {
    padding: 4px 16px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: ${blue[800]};
    }

    &.active {
      background-color: ${blue[900]};
      color: ${blue[100]};
    }
  }
`

const Header = () => {
  const dispatch = useDispatch()
  const { currentPage, token } = useSelector(state => state)
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

  const changePage = getPage => {
    if (getPage !== currentPage) {
      if (getPage === "home") {
        navigate(`/`)
      } else {
        navigate(`/${getPage}`)
      }
    }
  }

  const goLogout = () => {
    dispatch({
      type: `SET_TOKEN`,
      token: "",
    })
  }

  return (
    <AppBar>
      <Toolbar variant="dense">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <FontAwesomeIcon icon={faBars} style={{ fontSize: 20 }} />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Flex>
            <div
              role="presentation"
              className={currentPage === "home" ? "active" : ""}
              onClick={() => changePage("home")}
            >
              {site.siteMetadata.title}
            </div>
            <div
              role="presentation"
              className={currentPage === "about" ? "active" : ""}
              onClick={() => changePage("about")}
            >
              เกี่ยวกับ
            </div>
          </Flex>
        </Typography>
        {token !== "" && (
          <Button color="inherit" onClick={() => goLogout()}>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              style={{ fontSize: 20, marginRight: 5 }}
            />
            <span>ออกจากระบบ</span>
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
