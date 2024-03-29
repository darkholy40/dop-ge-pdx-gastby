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
import Warning from "../warning"
import { Flex, TextFieldDummyOutlined } from "../styles"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const Content = styled(Flex)`
  flex-direction: column;
`

const PositionInfoDialog = ({
  positionId,
  open,
  title,
  callback,
  viewOnly,
}) => {
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
      positionId !== `` &&
      roleLevel(userInfo.role) < 3
    ) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "positions->view => ${positionId}",
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
  }, [token, userInfo, positionId])

  const getPosition = useCallback(async () => {
    setProgressStatus({
      status: `loading`,
      text: `กำลังโหลดข้อมูล`,
    })

    if (positionId === `0`) {
      setProgressStatus({
        type: `not-found`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    try {
      const res = await client(token).query({
        query: gql`
        query Position {
          position(id: "${positionId}") {
            _id
            position_type {
              _id
              type
              name
            }
            number
            isOpen
            isSouth
            have_a_budget
            staff_created
            staff_updated
            createdAt
            updatedAt
            division {
              _id
              division1
              division2
              division3
            }
          }
        }
      `,
      })

      const returnData = res.data.position

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
        status: `not-found`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
    }
  }, [token, positionId])

  const closeModal = () => {
    callback()

    setTimeout(() => {
      setData(null)
      setProgressStatus({
        status: ``,
        text: ``,
      })
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
      getPosition()
    }
  }, [open, getPosition])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="lg"
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
                          เลขที่ตำแหน่ง
                        </TextFieldDummyOutlined.Label>
                        <span>{data.number || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อประเภทกลุ่มงาน
                        </TextFieldDummyOutlined.Label>
                        <span>{data.position_type.type || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อตำแหน่งในสายงาน
                        </TextFieldDummyOutlined.Label>
                        <span>{data.position_type.name || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สังกัด
                        </TextFieldDummyOutlined.Label>
                        <span>{renderDivision(data.division) || `-`}</span>
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
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          มีงบประมาณ
                        </TextFieldDummyOutlined.Label>
                        <span>{renderCheckIcon(data.have_a_budget)}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          เปิดอัตรา
                        </TextFieldDummyOutlined.Label>
                        <span>{renderCheckIcon(data.isOpen)}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          อัตรากำลังจังหวัดชายแดนภาคใต้
                        </TextFieldDummyOutlined.Label>
                        <span>{renderCheckIcon(data.isSouth)}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  {roleLevel(userInfo.role) >= 2 && (
                    <>
                      <Divider style={{ margin: `2rem auto`, width: `100%` }} />
                      <WhoCreated whoUpdated={agents.whoUpdated} />
                    </>
                  )}
                </>
              )}
            </Content>
          </Collapse>
          <Collapse in={progressStatus.status === `not-found`}>
            <Warning
              text="ไม่พบข้อมูล หรือข้อมูลส่วนนี้ถูกลบออกจากฐานข้อมูลแล้ว"
              variant="notfound"
            />
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
              <Tooltip arrow placement="bottom" title="แก้ไขคลังตำแหน่ง">
                <IconButton
                  style={{ width: 40, height: 40 }}
                  color="inherit"
                  onClick={() => {
                    navigate(`/positions/edit/?id=${positionId}`)
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

PositionInfoDialog.propTypes = {
  positionId: PropTypes.string,
  open: PropTypes.bool,
  title: PropTypes.string,
  callback: PropTypes.func,
  viewOnly: PropTypes.bool,
}

PositionInfoDialog.defaultProps = {
  positionId: ``,
  open: false,
  title: `ข้อมูลคลังตำแหน่ง`,
  callback: () => {},
  viewOnly: false,
}

export default PositionInfoDialog
