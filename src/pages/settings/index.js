import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUserAlt,
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
              width="800px"
              height="75px"
              style={{ marginBottom: `1rem` }}
              onClick={() => navigate(`/settings/general/`)}
              icon={<FontAwesomeIcon icon={faUserAlt} />}
              title="บัญชีผู้ใช้งาน"
              description="ชื่อ - สกุล / สังกัด / ตำแหน่ง / เปลี่ยนรหัสผ่าน"
            />
            <ColorButton
              width="800px"
              height="75px"
              style={{ marginBottom: `1rem` }}
              onClick={() => navigate(`/settings/unit/`)}
              icon={<FontAwesomeIcon icon={faBullseye} />}
              title="สังกัด"
              description="ตั้งค่าข้อมูลสังกัดสำหรับการออกรายงาน"
            />
            <ColorButton
              width="800px"
              height="75px"
              onClick={() => navigate(`/settings/system-data/`)}
              icon={<FontAwesomeIcon icon={faSync} />}
              title="อัปเดตฐานข้อมูลระบบ"
              description="ฐานข้อมูลสำหรับ Autocomplete ของแบบฟอร์ม"
            />
            <Divider style={{ width: `100%`, margin: `1rem 0` }} />

            <ColorButton
              width="800px"
              height="75px"
              style={{ marginBottom: `1rem` }}
              icon={<FontAwesomeIcon icon={faBook} />}
              title="ดาวน์โหลดคู่มือการใช้งานระบบ GE-PDX"
              href="https://ge-pdx.rta.mi.th/public/user_manual_GE-PDX.pdf"
            />
          </Container>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default SettingsIndex
