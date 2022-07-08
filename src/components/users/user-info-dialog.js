import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
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
import { grey } from "@mui/material/colors"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTimes,
  faPencilAlt,
  faCheckCircle as faFilledCheckCircle,
} from "@fortawesome/free-solid-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import WhoCreated from "../who-created"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"
import renderUserRole from "../../functions/render-user-role"

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  > p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const Line = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 12px;
  padding: 0.5rem 1rem;
`
const Label = styled.span`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
`

const UserInfoDialog = ({ userId, open, title, callback, viewOnly }) => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const [data, setData] = useState(null)
  const [progressStatus, setProgressStatus] = useState({
    status: ``,
    text: ``,
  })
  const [agents, setAgents] = useState({
    whoCreated: {
      id: ``,
      date: null,
    },
    whoUpdated: {
      id: ``,
      date: null,
    },
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
                description: "users->view => ${userId}",
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
          query User {
            user(id: "${userId}") {
              _id
              username
              rank
              name
              surname
              userPosition
              email
              confirmed
              blocked
              division {
                _id
                division1
                division2
                division3
              }
              role {
                _id
                name
              }
              staff_created
              staff_updated
              createdAt
              updatedAt
           }
         }`,
      })

      const returnData = res.data.user

      if (returnData !== null) {
        setData(returnData)
        setAgents({
          whoCreated: {
            id: returnData.staff_created,
            date: new Date(returnData.createdAt),
          },
          whoUpdated: {
            id: returnData.staff_updated,
            date: new Date(returnData.updatedAt),
          },
        })
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

  const renderCheckIcon = value => {
    if (value) {
      return (
        <FontAwesomeIcon
          icon={faFilledCheckCircle}
          style={{ fontSize: `1.25rem`, color: primaryColor[500] }}
        />
      )
    }

    return (
      <FontAwesomeIcon
        icon={faCheckCircle}
        style={{ fontSize: `1.25rem`, color: grey[500] }}
      />
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
                      <Line>
                        <Label>ยศ</Label>
                        <span>{data.rank || `-`}</span>
                      </Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <Line>
                        <Label>ชื่อ</Label>
                        <span>{data.name || `-`}</span>
                      </Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <Line>
                        <Label>สกุล</Label>
                        <span>{data.surname || `-`}</span>
                      </Line>
                    </Grid>
                    <Grid item xs={12}>
                      <Line>
                        <Label>ตำแหน่ง</Label>
                        <span>{data.userPosition || `-`}</span>
                      </Line>
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
                      <Line>
                        <Label>ชื่อผู้ใช้งาน</Label>
                        <span>{data.username || `-`}</span>
                      </Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <Line>
                        <Label>อีเมล</Label>
                        <span>{data.email || `-`}</span>
                      </Line>
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
                      <Line>
                        <Label>สังกัด</Label>
                        <span>{renderDivision(data.division) || `-`}</span>
                      </Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <Line>
                        <Label>ระดับผู้ใช้งาน</Label>
                        <span>
                          {data.role !== null
                            ? renderUserRole(data.role.name)
                            : `-`}
                        </span>
                      </Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <Line>
                        <Label>เปิดการใช้งาน</Label>
                        <span>{renderCheckIcon(data.confirmed)}</span>
                      </Line>
                    </Grid>
                  </Grid>
                  {roleLevel(userInfo.role) >= 2 && (
                    <>
                      <Divider style={{ margin: `2rem auto`, width: `100%` }} />
                      <WhoCreated
                        whoCreated={agents.whoCreated}
                        whoUpdated={agents.whoUpdated}
                      />
                    </>
                  )}
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
        {!viewOnly && (
          <>
            <DialogActions sx={{ position: `absolute`, top: 0, right: 45 }}>
              <Tooltip arrow placement="bottom" title="แก้ไขข้อมูลผู้ใช้งาน">
                <IconButton
                  style={{ width: 40, height: 40 }}
                  color="inherit"
                  onClick={() => {
                    navigate(`/users/edit/?id=${userId}`)
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    style={{ fontSize: 20 }}
                  />
                </IconButton>
              </Tooltip>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}

UserInfoDialog.propTypes = {
  userId: PropTypes.string,
  open: PropTypes.bool,
  title: PropTypes.string,
  callback: PropTypes.func,
  viewOnly: PropTypes.bool,
}

UserInfoDialog.defaultProps = {
  userId: ``,
  open: false,
  title: `ข้อมูลผู้ใช้งาน`,
  callback: () => {},
  viewOnly: false,
}

export default UserInfoDialog
