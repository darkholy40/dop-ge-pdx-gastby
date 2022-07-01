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

const EditPositionsPage = ({ location }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()

  const search = location.search.split("id=")
  const id = search[1] || `0`

  // useEffect(() => {
  //   const search = location.search.split("id=")
  //   console.log(search[1])
  // }, [location])

  // useEffect(() => {
  //   console.log(addPositionFilter)
  // }, [addPositionFilter])

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
                description: "positions -> edit -> ${id}",
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
          <Seo title="แก้ไขคลังตำแหน่ง" />
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
              {
                name: `ค้นหาคลังตำแหน่ง`,
                link: `/positions/list/`,
              },
            ]}
            current="แก้ไขคลังตำแหน่ง"
          />

          <PositionForm modification id={id} />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default EditPositionsPage
