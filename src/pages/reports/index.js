import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { ColorButton } from "../../components/styles"
import roles from "../../static/roles"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const IndexPage = () => {
  const { token, primaryColor, userInfo } = useSelector(
    ({ mainReducer }) => mainReducer
  )
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
                description: "reports",
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
      currentPage: `reports`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 2 ? (
        <>
          <Seo title="ออกรายงาน" />
          <Breadcrumbs current="ออกรายงาน" />

          <Container>
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
            >
              <div className="row">
                <div
                  role="presentation"
                  onClick={() => navigate(`/reports/stock/`)}
                >
                  รายชื่อพนักงานราชการและตำแหน่งว่าง (Stock)
                </div>
              </div>
            </ColorButton>
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
            >
              <div className="row">
                <div
                  role="presentation"
                  onClick={() => navigate(`/reports/flow-out/`)}
                >
                  รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)
                </div>
              </div>
            </ColorButton>
          </Container>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default IndexPage
