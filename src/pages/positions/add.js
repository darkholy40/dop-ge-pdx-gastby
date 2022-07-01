import React, { useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import PositionForm from "../../components/positions/form"
import renderDivision from "../../functions/render-division"
import roles from "../../static/roles"

const AddPositionsPage = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (
      token !== `` &&
      userInfo._id !== `` &&
      roles[userInfo.role.name].level < 3
    ) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "positions -> add",
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
      currentPage: `positions`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo title="เพิ่มคลังตำแหน่ง" />
          <Breadcrumbs
            previous={[
              {
                name:
                  roles[userInfo.role.name].level <= 1
                    ? `คลังตำแหน่ง (${
                        userInfo.division !== null
                          ? renderDivision(userInfo.division)
                          : `-`
                      })`
                    : `คลังตำแหน่ง`,
                link: `/positions/`,
              },
            ]}
            current="เพิ่มคลังตำแหน่ง"
          />

          <PositionForm />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default AddPositionsPage
