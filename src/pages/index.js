import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Login from "../components/Login"

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

  return (
    <Layout>
      {token === `` ? (
        <>
          <Seo title="ลงชื่อเข้าใช้งานระบบ" />

          <Login />
        </>
      ) : (
        <>
          <Seo title="หน้าแรก" />

          <Container>
            <p>ยินดีต้อนรับเข้าสู่ระบบพนักงานราชการและลูกจ้าง</p>
          </Container>
        </>
      )}
    </Layout>
  )
}

export default IndexPage
