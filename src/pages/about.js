import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"

import Layout from "../components/Layout"
import Seo from "../components/Seo"

const AboutPage = () => {
  const { token } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `about`,
    })
  }, [dispatch])

  return (
    <Layout>
      <Seo title="About" />

      <p style={{ wordBreak: "break-word" }}>My token is: {token}</p>
      <h1>This is about page</h1>
      <p>That's all... Enjoy creating your web site.</p>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </Layout>
  )
}

export default AboutPage
