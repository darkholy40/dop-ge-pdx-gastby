import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Login from "../components/login"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const IndexPage = () => {
  const { token } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `home`,
    })
  }, [dispatch])

  useEffect(() => {
    if (token !== ``) {
      navigate(`/people/`)
    }
  }, [token])

  return (
    <Layout>
      {token === `` ? (
        <>
          <Seo title="ลงชื่อเข้าใช้งานระบบ" />

          <Login />
        </>
      ) : (
        <>
          <Seo title="ระบบกำลังนำท่านไปยังหน้าจัดการประวัติกำลังพล" />

          <Container>
            <p>ระบบกำลังนำท่านไปยังหน้าจัดการประวัติกำลังพล</p>
          </Container>
        </>
      )}
    </Layout>
  )
}

export default IndexPage
