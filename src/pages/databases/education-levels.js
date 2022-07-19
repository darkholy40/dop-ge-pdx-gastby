import React, { useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import roleLevel from "../../functions/role-level"

const EducationLevels = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "databases->education-levels",
                users_permissions_user: "${userInfo._id}",
              }
            }) {
              log {
                _id
              }
            }
          }
        `,
      })
    }
  }, [token, userInfo])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `databases`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="ระดับการศึกษา" />
          <Breadcrumbs
            previous={[
              {
                name: `การจัดการฐานข้อมูล`,
                link: `/databases/`,
              },
            ]}
            current="ระดับการศึกษา"
          />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default EducationLevels
