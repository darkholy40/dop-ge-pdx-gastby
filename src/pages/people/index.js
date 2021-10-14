import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"

const PositionsPage = () => {
  const { token } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== "" ? (
        <>
          <Seo title="จัดการประวัติกำลังพล" />
          <Breadcrumbs current="จัดการประวัติกำลังพล" />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
