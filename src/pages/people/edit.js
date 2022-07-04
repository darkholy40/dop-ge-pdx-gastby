import React, { useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PersonForm from "../../components/people/form"
import PageNotFound from "../../components/page-not-found"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/roleLevel"

const EditPersonPage = ({ location }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()

  const search = location.search.split("id=")
  const id = search[1] || `0`

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "people -> edit -> ${id}",
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
  }, [token, userInfo, id])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 1 ? (
        <>
          <Seo title="แก้ไขประวัติกำลังพล" />
          <Breadcrumbs
            previous={[
              {
                name:
                  roleLevel(userInfo.role) <= 1
                    ? `ประวัติกำลังพล (${
                        userInfo.division !== null
                          ? renderDivision(userInfo.division)
                          : `-`
                      })`
                    : `ประวัติกำลังพล`,
                link: `/people/`,
              },
              {
                name: `ค้นหากำลังพล`,
                link: `/people/list/`,
              },
            ]}
            current="แก้ไขประวัติกำลังพล"
          />

          <PersonForm modification id={id} />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default EditPersonPage
