import React from "react"
import { useSelector, useDispatch } from "react-redux"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import PageNotFound from "../components/page-not-found"

const UserManagement = () => {
  const { token, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `user-management`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` && userInfo.role.name === `Super Administrator` ? (
        <>
          <Seo title="จัดการผู้ใช้งาน" />
          <Breadcrumbs current="จัดการผู้ใช้งาน" />

          <div>User Management Page</div>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default UserManagement