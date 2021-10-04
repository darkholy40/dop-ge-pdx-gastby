import * as React from "react"
import { navigate } from "gatsby"

import Layout from "../components/Layout"
import Seo from "../components/Seo"

const NotFoundPage = () => {
  return (
    <Layout>
      <Seo title="Not found" />
      <h1>Page not found</h1>
      <p>we couldn’t find what you were looking for.</p>
      <button onClick={() => navigate("/")}>Go home</button>
    </Layout>
  )
}

export default NotFoundPage
