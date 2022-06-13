import React from "react"
import { useSelector, useDispatch } from "react-redux"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import PageNotFound from "../components/page-not-found"

const Activities = () => {
  const { token, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `activities`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` && userInfo.role.name === `Super Administrator` ? (
        <>
          <Seo title="ประวัติการใช้งานระบบ" />
          <Breadcrumbs current="ประวัติการใช้งานระบบ" />

          <div>Activities Page</div>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default Activities
