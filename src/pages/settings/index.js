import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDatabase, faAddressCard } from "@fortawesome/free-solid-svg-icons"

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

const SettingsIndex = () => {
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
                description: "settings",
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
      currentPage: `settings`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo title="การตั้งค่า" />
          <Breadcrumbs current="การตั้งค่า" />

          <Container>
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
            >
              <div className="row">
                <div
                  role="presentation"
                  onClick={() => navigate(`/settings/system-data/`)}
                >
                  <FontAwesomeIcon
                    icon={faDatabase}
                    style={{
                      fontSize: `1.5rem`,
                      marginRight: 8,
                      minWidth: 35,
                    }}
                  />
                  <span>ข้อมูลระบบ</span>
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
                  onClick={() => navigate(`/settings/general/`)}
                >
                  <FontAwesomeIcon
                    icon={faAddressCard}
                    style={{
                      fontSize: `1.5rem`,
                      marginRight: 8,
                      minWidth: 35,
                    }}
                  />
                  <span>บัญชีผู้ใช้งาน</span>
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

export default SettingsIndex
