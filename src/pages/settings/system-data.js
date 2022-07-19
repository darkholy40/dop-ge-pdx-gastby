import React, { useEffect, useCallback, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, Divider } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { Form } from "../../components/styles"
import SystemData from "../../components/system-data"
import ConfirmationDialog from "../../components/confirmation-dialog"

import roleLevel from "../../functions/role-level"

const ButtonBlock = styled.div`
  display: inline-flex;
  justify-content: flex-end;
`

const buttons = {
  removeAll: {
    name: `ยกเลิกการติดตั้งทั้งหมด`,
  },
}

const SettingsSystemData = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const {
    positionTypes,
    positionNames,
    units,
    locations,
    educationLevels,
    educationNames,
    educationalInstitutions,
    countries,
    decorations,
  } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [openDeleteAllConfirmationDialog, setOpenDeleteAllConfirmationDialog] =
    useState(false)

  const savePageView = useCallback(() => {
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "settings->system-data",
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
      currentPage: `settings-system-data`,
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
          <Breadcrumbs
            previous={[
              {
                name: `การตั้งค่า`,
                link: `/settings/`,
              },
            ]}
            current="อัปเดตฐานข้อมูลระบบ"
          />

          <SystemData showContent={true} />
          {process.env.SERVER_TYPE === `dev` && (
            <>
              {(positionTypes.length > 0 ||
                positionNames.length > 0 ||
                units.length > 0 ||
                locations.length > 0 ||
                educationLevels.length > 0 ||
                educationNames.length > 0 ||
                educationalInstitutions.length > 0 ||
                countries.length > 0 ||
                decorations.length > 0) && (
                <>
                  <Divider
                    style={{ marginTop: `2rem`, marginBottom: `1rem` }}
                  />
                  <p style={{ textAlign: `right` }}>สำหรับทดสอบฟังก์ชัน</p>
                  <Form style={{ maxWidth: `100%` }}>
                    <ButtonBlock>
                      <Button
                        sx={{
                          marginLeft: `1rem`,
                        }}
                        color="error"
                        variant="outlined"
                        onClick={() => setOpenDeleteAllConfirmationDialog(true)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ marginRight: 5 }}
                        />
                        {buttons.removeAll.name}
                      </Button>
                    </ButtonBlock>
                  </Form>
                </>
              )}
              <ConfirmationDialog
                open={openDeleteAllConfirmationDialog}
                title="ยืนยันการยกเลิกการติดตั้งทั้งหมด?"
                description={`กดปุ่ม "ตกลง" เพื่อยกเลิกการติดตั้งทั้งหมด`}
                variant="delete"
                confirmCallback={() => {
                  dispatch({
                    type: `SET_ZERO`,
                  })
                  dispatch({
                    type: `SET_TUTORIAL_COUNT`,
                    tutorialCount: 0,
                  })
                  navigate(`/`)
                }}
                cancelCallback={() => {
                  setOpenDeleteAllConfirmationDialog(false)
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          <PageNotFound />
        </>
      )}
    </Layout>
  )
}

export default SettingsSystemData
