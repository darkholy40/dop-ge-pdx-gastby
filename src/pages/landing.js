import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { CircularProgress } from "@mui/material"
import { grey } from "@mui/material/colors"

import Layout from "../components/layout"
import Seo from "../components/seo"

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 172px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const LandingPage = () => {
  const { token, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `home`,
    })
  }, [dispatch])

  useEffect(() => {
    setTimeout(() => {
      if (userInfo.role.name === `Super Administrator`) {
        navigate(`/user-management/`)
      } else {
        navigate(`/people/`)
      }
    }, 100)
  }, [userInfo, dispatch])

  return (
    <Layout>
      {token !== `` && (
        <>
          <Seo title={`Redirecting...`} />
          <Container>
            <CircularProgress color="primary" size="5rem" thickness={5} />
            <p style={{ color: grey[500] }}>Redirecting...</p>
          </Container>
        </>
      )}
    </Layout>
  )
}

export default LandingPage
