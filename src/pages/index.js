import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Login from "../components/Login"

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
      {token === "" ? (
        <>
          <Seo title="ลงชื่อเข้าใช้งานระบบ" />

          <Login />
        </>
      ) : (
        <>
          <Seo title="หน้าแรก" />

          <p>Verified</p>
        </>
      )}
    </Layout>
  )
}

export default IndexPage
