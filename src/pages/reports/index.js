import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPrint } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { ColorButton } from "../../components/styles"
import roleLevel from "../../functions/role-level"

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
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
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
      {token !== `` && roleLevel(userInfo.role) >= 1 ? (
        <>
          <Seo title="การออกรายงาน" />
          <Breadcrumbs current="การออกรายงาน" />

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
                  <FontAwesomeIcon
                    icon={faPrint}
                    style={{
                      fontSize: `1.5rem`,
                      marginRight: 8,
                      minWidth: 35,
                    }}
                  />
                  <span>รายชื่อพนักงานราชการและตำแหน่งว่าง (Stock)</span>
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
                  <FontAwesomeIcon
                    icon={faPrint}
                    style={{
                      fontSize: `1.5rem`,
                      marginRight: 8,
                      minWidth: 35,
                    }}
                  />
                  <span>
                    รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)
                  </span>
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
