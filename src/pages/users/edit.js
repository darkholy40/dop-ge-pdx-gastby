import React, { useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import UserForm from "../../components/users/form"
import roleLevel from "../../functions/role-level"

const EditUserPage = ({ location }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()

  const params = new URLSearchParams(location.search)
  const id = params.get(`id`)

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "users->edit => ${id}",
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
      currentPage: `users`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="แก้ไขผู้ใช้งาน" />
          <Breadcrumbs
            previous={[
              {
                name: `ผู้ใช้งาน`,
                link: `/users/`,
              },
            ]}
            current="แก้ไขผู้ใช้งาน"
          />

          <UserForm modification id={id} />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default EditUserPage
