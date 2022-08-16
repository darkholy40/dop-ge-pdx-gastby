import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faAddressCard,
  faBook,
  faBullseye,
  faSync,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { ColorButton } from "../../components/styles"
import roleLevel from "../../functions/role-level"
import { Divider } from "@mui/material"

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
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
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
      {token !== `` && roleLevel(userInfo.role) >= 1 ? (
        <>
          <Seo title="การตั้งค่า" />
          <Breadcrumbs current="การตั้งค่า" />

          <Container>
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
              style={{ marginBottom: `1rem` }}
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
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
              style={{ marginBottom: `1rem` }}
            >
              <div className="row">
                <div
                  role="presentation"
                  onClick={() => navigate(`/settings/unit/`)}
                >
                  <FontAwesomeIcon
                    icon={faBullseye}
                    style={{
                      fontSize: `1.5rem`,
                      marginRight: 8,
                      minWidth: 35,
                    }}
                  />
                  <span>หน่วย</span>
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
                  onClick={() => navigate(`/settings/system-data/`)}
                >
                  <FontAwesomeIcon
                    icon={faSync}
                    style={{
                      fontSize: `1.5rem`,
                      marginRight: 8,
                      minWidth: 35,
                    }}
                  />
                  <span>อัปเดตฐานข้อมูลระบบ</span>
                </div>
              </div>
            </ColorButton>
            <Divider style={{ width: `100%`, margin: `1rem 0` }} />

            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
              style={{ marginBottom: `1rem` }}
            >
              <a
                style={{
                  textDecoration: `none`,
                  color: `unset`,
                  width: `100%`,
                  maxWidth: 800,
                }}
                href="https://ge-pdx.rta.mi.th/public/user_manual_GE-PDX.pdf"
                target="_blank"
                rel="noreferrer"
              >
                <div className="row">
                  <div role="presentation" onClick={() => {}}>
                    <FontAwesomeIcon
                      icon={faBook}
                      style={{
                        fontSize: `1.5rem`,
                        marginRight: 8,
                        minWidth: 35,
                      }}
                    />
                    <span>ดาวน์โหลดคู่มือการใช้งานระบบ GE-PDX</span>
                  </div>
                </div>
              </a>
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
