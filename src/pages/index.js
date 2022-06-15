import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { CircularProgress } from "@mui/material"
import { grey } from "@mui/material/colors"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Login from "../components/login"

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 172px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const IndexPage = () => {
  const { token, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `home`,
    })
  }, [dispatch])

  useEffect(() => {
    const goNavigate = async () => {
      if (token !== ``) {
        if (userInfo.role.name === `Super Administrator`) {
          await navigate(`/user-management/`)
        } else {
          await navigate(`/people/`)
        }
      } else {
        await navigate(`/`)
      }
    }

    goNavigate()
  }, [token, userInfo, dispatch])

  return (
    <Layout>
      {token === `` ? (
        <>
          <Seo title="ลงชื่อเข้าใช้งานระบบ" />
          <Login />
        </>
      ) : (
        <>
          <Seo
            title={`ระบบกำลังนำท่านไปยังหน้า${
              userInfo.role.name === `Super Administrator`
                ? `จัดการผู้ใช้งาน`
                : `จัดการประวัติกำลังพล`
            }`}
          />
          <Container>
            <CircularProgress color="primary" size="5rem" thickness={5} />
            <p style={{ color: grey[700] }}>
              ระบบกำลังนำท่านไปยังหน้า
              {userInfo.role.name === `Super Administrator`
                ? `จัดการผู้ใช้งาน`
                : `จัดการประวัติกำลังพล`}
            </p>
          </Container>
        </>
      )}
    </Layout>
  )
}

export default IndexPage
