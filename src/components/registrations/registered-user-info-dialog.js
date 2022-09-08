import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  LinearProgress,
  Tooltip,
  Collapse,
} from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTimes,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import { Flex, TextFieldDummyOutlined } from "../styles"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const Content = styled(Flex)`
  flex-direction: column;
`

const RegisteredUserInfoDialog = ({ userId, open, title, callback }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const [data, setData] = useState(null)
  const [progressStatus, setProgressStatus] = useState({
    status: ``,
    text: ``,
  })

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (
      token !== `` &&
      userInfo._id !== `` &&
      userId !== `` &&
      roleLevel(userInfo.role) < 3
    ) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "user-approvals->view => ${userId}",
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
  }, [token, userInfo, userId])

  const getUser = useCallback(async () => {
    setProgressStatus({
      status: `loading`,
      text: `กำลังโหลดข้อมูล`,
    })

    if (userId === `0`) {
      setProgressStatus({
        type: `not-found`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    try {
      const res = await client(token).query({
        query: gql`
          query Registration {
            registration(id: "${userId}") {
              _id
              username
              rank
              name
              surname
              position
              email
              is_approved
              is_completed
              division {
                _id
                division1
                division2
                division3
              }
              users_permissions_user {
                _id
              }
              createdAt
              updatedAt
           }
         }`,
      })

      const returnData = res.data.registration

      if (returnData !== null) {
        setData(returnData)
        setProgressStatus({
          status: ``,
          text: ``,
        })
      } else {
        setProgressStatus({
          status: `error`,
          text: `ข้อมูลผิดพลาดผิดพลาด`,
        })
      }
    } catch (error) {
      console.log(error.message)

      setProgressStatus({
        status: `error`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
    }
  }, [token, userId])

  const closeModal = () => {
    callback()

    setTimeout(() => {
      setData(null)
    }, 200)
  }

  const renderCheckIcon = (isCompleted, isApproved) => {
    if (isCompleted) {
      if (isApproved) {
        return (
          <div
            style={{
              display: `flex`,
              justifyContent: `flex-start`,
              alignItems: `center`,
            }}
          >
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ fontSize: `1.25rem`, color: green[500], marginRight: 5 }}
            />
            <span>อนุมัติแล้ว</span>
          </div>
        )
      }

      return (
        <div
          style={{
            display: `flex`,
            justifyContent: `flex-start`,
            alignItems: `center`,
          }}
        >
          <FontAwesomeIcon
            icon={faTimesCircle}
            style={{ fontSize: `1.25rem`, color: red[500], marginRight: 5 }}
          />
          <span>ไม่ผ่านการอนุมัติ</span>
        </div>
      )
    }

    return (
      <div
        style={{
          display: `flex`,
          justifyContent: `flex-start`,
          alignItems: `center`,
        }}
      >
        <FontAwesomeIcon
          icon={faInfoCircle}
          style={{ fontSize: `1.25rem`, color: grey[500], marginRight: 5 }}
        />
        <span>รอการอนุมัติ</span>
      </div>
    )
  }

  useEffect(() => {
    if (open) {
      getUser()
    }
  }, [open, getUser])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        scroll="paper"
        open={open}
        onClose={() => closeModal()}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers sx={{ padding: `24px` }}>
          <Collapse in={data !== null && progressStatus.status === ``}>
            <Content>
              {data !== null && progressStatus.status === `` && (
                <>
                  <Grid container spacing={2}>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ยศ
                        </TextFieldDummyOutlined.Label>
                        <span>{data.rank || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อ
                        </TextFieldDummyOutlined.Label>
                        <span>{data.name || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สกุล
                        </TextFieldDummyOutlined.Label>
                        <span>{data.surname || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ตำแหน่ง
                        </TextFieldDummyOutlined.Label>
                        <span>{data.position || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  <Divider
                    style={{
                      margin: `2rem auto`,
                      width: 360,
                      maxWidth: `100%`,
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อผู้ใช้งาน
                        </TextFieldDummyOutlined.Label>
                        <span>{data.username || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          อีเมล
                        </TextFieldDummyOutlined.Label>
                        <span>{data.email || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  <Divider
                    style={{
                      margin: `2rem auto`,
                      width: 360,
                      maxWidth: `100%`,
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สังกัด
                        </TextFieldDummyOutlined.Label>
                        <span>{renderDivision(data.division) || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สถานะ
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {renderCheckIcon(data.is_completed, data.is_approved)}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                </>
              )}
            </Content>
          </Collapse>
          {progressStatus.status === `loading` && (
            <Content>
              <div
                style={{
                  width: `100%`,
                  display: `flex`,
                  alignItems: `center`,
                  justifyContent: `center`,
                  flexDirection: `column`,
                  padding: `2rem`,
                }}
              >
                <LinearProgress
                  color="primary"
                  sx={{
                    width: `100%`,
                    maxWidth: `360px`,
                    height: `12px`,
                    borderRadius: `8px`,
                    ".MuiLinearProgress-bar": { borderRadius: `8px` },
                  }}
                />
              </div>
            </Content>
          )}
        </DialogContent>
        <DialogActions sx={{ position: `absolute`, top: 0, right: 0 }}>
          <Tooltip arrow placement="bottom" title="ปิดหน้าต่าง">
            <IconButton
              style={{ width: 40, height: 40 }}
              onClick={() => closeModal()}
            >
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </>
  )
}

RegisteredUserInfoDialog.propTypes = {
  userId: PropTypes.string,
  open: PropTypes.bool,
  title: PropTypes.string,
  callback: PropTypes.func,
}

RegisteredUserInfoDialog.defaultProps = {
  userId: ``,
  open: false,
  title: `ข้อมูลผู้ลงทะเบียน`,
  callback: () => {},
}

export default RegisteredUserInfoDialog
