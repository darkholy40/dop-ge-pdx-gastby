import React, { useEffect, useState, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Alert,
} from "@mui/material"
import jwt_decode from "jwt-decode"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLock,
  faKey,
  faEye,
  faEyeSlash,
  faCheck,
  faSave,
} from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import renderFullname from "../../functions/render-fullname"
import renderDivision from "../../functions/render-division"
import renderUserRole from "../../functions/render-user-role"
import roleLevel from "../../functions/role-level"
import { green } from "@mui/material/colors"

const Container = styled.div`
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  padding: 16px 24px;
  max-width: 800px;
  margin: auto;
`

const Flex = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1.25rem;
`

const Left = styled.div`
  width: 100%;
  max-width: 300px;

  p {
    text-align: right;
    margin: 0;
    font-weight: bold;
    font-style: italic;
  }
`

const Right = styled.div`
  width: 100%;
  margin-left: 1.5rem;

  p {
    word-break: break-word;
    margin: 0;
  }
`

const SettingsGeneral = () => {
  const { token, userInfo, backdropDialog } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { sessionTimer } = useSelector(({ timerReducer }) => timerReducer)
  const dispatch = useDispatch()
  const [rows, setRows] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [passwordChangeConfirmed, setPasswordChangeConfirmed] = useState(false)
  const [inputs, setInputs] = useState({
    oldPass: ``,
    newPass: ``,
    confirmedNewPass: ``,
  })
  const [inputsVisible, setInputsVisible] = useState({
    oldPass: false,
    newPass: false,
    confirmedNewPass: false,
  })
  const [oldPassIsCorrect, setOldPassIsCorrect] = useState(false)
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false)

  const savePageView = useCallback(() => {
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "settings->general",
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

  const clearInputs = useCallback(() => {
    setIsError({
      status: false,
      text: ``,
    })
    setPasswordChangeConfirmed(false)
    setInputs({
      oldPass: ``,
      newPass: ``,
      confirmedNewPass: ``,
    })
    setInputsVisible({
      oldPass: false,
      newPass: false,
      confirmedNewPass: false,
    })
    setOldPassIsCorrect(false)
  }, [])

  const goVeriryOldPass = async () => {
    setOldPassIsCorrect(false)
    setIsError({
      status: false,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const res = await axios.post(`${process.env.GEPDX_API_URL}/auth/local`, {
        identifier: userInfo.username,
        password: inputs.oldPass,
      })

      switch (res.status) {
        case 200:
          // old pass -> correct
          setOldPassIsCorrect(true)
          setInputsVisible(prev => {
            return {
              ...prev,
              oldPass: false,
            }
          })
          break

        default:
          setIsError({
            status: true,
            text: `Error - ${res.status}`,
          })
          break
      }
    } catch (error) {
      const status = error.response !== undefined ? error.response.status : 0

      switch (status) {
        case 400:
          setIsError({
            status: true,
            text: `รหัสผ่านเดิมไม่ถูกต้อง`,
          })
          break

        default:
          setIsError({
            status: true,
            text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
          })
          break
      }
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }

  const goSaveNewPass = async () => {
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      await client(token).mutate({
        mutation: gql`
          mutation UpdateUser {
            updateUser(input: {
              where: {
                id: "${userInfo._id}"
              }
              data: {
                password: "${inputs.newPass}",
              }
            }) {
              user {
                _id
              }
            }
          }
        `,
      })

      clearInputs()
      setIsPasswordUpdated(true)

      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "action",
                description: "change password",
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
    } catch (error) {
      console.log(error.message)

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การบันทึกข้อมูลไม่สำเร็จ`,
          description: `ไม่สามารถบันทึกข้อมูลการเปลี่ยนรหัสผ่านได้`,
          variant: `error`,
          confirmText: `ตกลง`,
          callback: () => {},
        },
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `settings-general`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (token !== ``) {
      // console.log(userInfo)
      const decodedToken = jwt_decode(token)
      const maxTimer = (decodedToken.exp - decodedToken.iat) / 3600
      const showToken = process.env.SERVER_TYPE === `dev`

      let users = [
        {
          title: `ชื่อ - สกุล`,
          desc: renderFullname(userInfo),
        },
        {
          title: `ชื่อผู้ใช้`,
          desc: userInfo.username,
        },
        {
          title: `สังกัด`,
          desc:
            userInfo.division !== null
              ? renderDivision(userInfo.division)
              : `-`,
        },
        {
          title: `ตำแหน่ง`,
          desc: userInfo.userPosition,
        },
        {
          title: ``,
        },
        {
          title: `ระดับผู้ใช้งาน`,
          desc: renderUserRole(userInfo.role.name),
        },
        {
          title: `ระยะเวลาเซสชัน`,
          desc: `${maxTimer} ชม. (คงเหลือ ${sessionTimer.hr}:${sessionTimer.min}:${sessionTimer.sec})`,
        },
      ]

      if (showToken) {
        users = [
          ...users,
          {
            title: `Token`,
            desc: token,
          },
        ]
      }
      setRows(users)
    }
  }, [userInfo, token, sessionTimer])

  useEffect(() => {
    if (!passwordChangeConfirmed) {
      clearInputs()
    } else {
      setIsPasswordUpdated(false)
    }
  }, [passwordChangeConfirmed, clearInputs])

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
            current="บัญชีผู้ใช้งาน"
          />

          <Container>
            {rows.map(row => {
              return row.title !== `` ? (
                <Flex key={`${row.title}_${row.index}`}>
                  <Left>
                    <p>{row.title}</p>
                  </Left>
                  <Right>
                    <p>{row.desc}</p>
                  </Right>
                </Flex>
              ) : (
                <Divider
                  key={`${row.title}_${row.index}`}
                  style={{ margin: `1rem auto`, width: 480, maxWidth: `100%` }}
                />
              )
            })}
            <Divider
              style={{ margin: `1rem auto`, width: 480, maxWidth: `100%` }}
            />
            <form
              onSubmit={e => {
                e.preventDefault()

                if (!oldPassIsCorrect) {
                  goVeriryOldPass()
                } else {
                  goSaveNewPass()
                }
              }}
            >
              <Flex
                style={{
                  flexDirection: `column`,
                  alignItems: `center`,
                  width: `100%`,
                  maxWidth: 480,
                  margin: `1rem auto`,
                }}
              >
                <p>รหัสผ่าน</p>

                <Collapse in={isPasswordUpdated}>
                  <div
                    style={{
                      width: `100%`,
                      maxWidth: `800px`,
                      marginLeft: `auto`,
                      marginRight: `auto`,
                    }}
                  >
                    <Alert
                      variant="standard"
                      color="success"
                      sx={{ marginBottom: `1rem` }}
                    >
                      อัปเดตรหัสผ่านแล้ว
                    </Alert>
                  </div>
                </Collapse>

                <div>
                  <Button
                    onClick={() =>
                      setPasswordChangeConfirmed(!passwordChangeConfirmed)
                    }
                    color={!passwordChangeConfirmed ? `primary` : `error`}
                    variant={
                      !passwordChangeConfirmed
                        ? !isPasswordUpdated
                          ? `contained`
                          : `outlined`
                        : `text`
                    }
                  >
                    {!passwordChangeConfirmed
                      ? !isPasswordUpdated
                        ? `เปลี่ยนรหัสผ่าน`
                        : `เปลี่ยนรหัสผ่านอีกครั้ง`
                      : `ยกเลิกการเปลี่ยนรหัสผ่าน`}
                  </Button>
                </div>

                {passwordChangeConfirmed && (
                  <>
                    <div style={{ marginTop: `1rem`, width: `100%` }}>
                      <TextField
                        style={{ width: `100%` }}
                        label="รหัสผ่านเดิม"
                        size="small"
                        variant="outlined"
                        type={inputsVisible.oldPass ? `text` : `password`}
                        onChange={e => {
                          setInputs(prev => ({
                            ...prev,
                            oldPass: e.target.value,
                          }))
                          setOldPassIsCorrect(false)
                          setIsError({
                            status: false,
                            text: ``,
                          })
                        }}
                        value={inputs.oldPass}
                        disabled={oldPassIsCorrect}
                        error={isError.status}
                        helperText={isError.status ? `* ${isError.text}` : ``}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FontAwesomeIcon
                                icon={faLock}
                                style={{ fontSize: 16 }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {inputs.oldPass !== `` && !oldPassIsCorrect && (
                                <IconButton
                                  onClick={() =>
                                    setInputsVisible(prev => {
                                      return {
                                        ...prev,
                                        oldPass: !inputsVisible.oldPass,
                                      }
                                    })
                                  }
                                  color="inherit"
                                  style={{
                                    width: 30,
                                    height: 30,
                                    marginRight: 5,
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      !inputsVisible.oldPass
                                        ? faEye
                                        : faEyeSlash
                                    }
                                    style={{ fontSize: 14 }}
                                  />
                                </IconButton>
                              )}
                              {!oldPassIsCorrect ? (
                                <Button
                                  type="submit"
                                  color="primary"
                                  variant="contained"
                                  size="small"
                                  disabled={
                                    inputs.oldPass === `` || backdropDialog.open
                                  }
                                >
                                  ยืนยัน
                                </Button>
                              ) : (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  style={{ fontSize: 16, color: green[500] }}
                                />
                              )}
                            </>
                          ),
                        }}
                      />

                      {oldPassIsCorrect && (
                        <>
                          <TextField
                            style={{ width: `100%`, marginTop: `1rem` }}
                            label="รหัสผ่านใหม่"
                            size="small"
                            variant="outlined"
                            type={inputsVisible.newPass ? `text` : `password`}
                            onChange={e => {
                              setInputs(prev => ({
                                ...prev,
                                newPass: e.target.value,
                              }))
                            }}
                            value={inputs.newPass}
                            error={
                              (inputs.newPass.length < 8 &&
                                inputs.confirmedNewPass !== ``) ||
                              inputs.newPass === inputs.oldPass
                            }
                            helperText={
                              inputs.newPass !== `` && inputs.newPass.length < 8
                                ? `* ต้องมีอักขระอย่างน้อย 8 ตัว`
                                : inputs.newPass === inputs.oldPass
                                ? `* รหัสผ่านจะไม่เปลี่ยนแปลง กรุณากรอกรหัสผ่านใหม่`
                                : ``
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FontAwesomeIcon
                                    icon={faKey}
                                    style={{ fontSize: 16 }}
                                  />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <>
                                  {inputs.newPass && (
                                    <IconButton
                                      tabIndex={-1}
                                      onClick={() =>
                                        setInputsVisible(prev => {
                                          return {
                                            ...prev,
                                            newPass: !inputsVisible.newPass,
                                          }
                                        })
                                      }
                                      color="inherit"
                                      style={{
                                        width: 30,
                                        height: 30,
                                        marginRight: 5,
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          !inputsVisible.newPass
                                            ? faEye
                                            : faEyeSlash
                                        }
                                        style={{ fontSize: 14 }}
                                      />
                                    </IconButton>
                                  )}
                                </>
                              ),
                            }}
                          />
                          <TextField
                            style={{ width: `100%`, marginTop: `1rem` }}
                            label="ยืนยันรหัสผ่านใหม่"
                            size="small"
                            variant="outlined"
                            type={
                              inputsVisible.confirmedNewPass
                                ? `text`
                                : `password`
                            }
                            onChange={e => {
                              setInputs(prev => ({
                                ...prev,
                                confirmedNewPass: e.target.value,
                              }))
                            }}
                            value={inputs.confirmedNewPass}
                            error={
                              inputs.confirmedNewPass.length >= 8 &&
                              inputs.newPass !== inputs.confirmedNewPass
                            }
                            helperText={
                              inputs.confirmedNewPass.length >= 8 &&
                              inputs.newPass !== inputs.confirmedNewPass
                                ? `* การยืนยันรหัสผ่านไม่ตรงกัน`
                                : ``
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FontAwesomeIcon
                                    icon={faKey}
                                    style={{ fontSize: 16 }}
                                  />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <>
                                  {inputs.confirmedNewPass && (
                                    <IconButton
                                      tabIndex={-1}
                                      onClick={() =>
                                        setInputsVisible(prev => {
                                          return {
                                            ...prev,
                                            confirmedNewPass:
                                              !inputsVisible.confirmedNewPass,
                                          }
                                        })
                                      }
                                      color="inherit"
                                      style={{
                                        width: 30,
                                        height: 30,
                                        marginRight: 5,
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          !inputsVisible.confirmedNewPass
                                            ? faEye
                                            : faEyeSlash
                                        }
                                        style={{ fontSize: 14 }}
                                      />
                                    </IconButton>
                                  )}
                                </>
                              ),
                            }}
                          />
                          <div style={{ marginTop: `1rem` }}>
                            <Button
                              type="submit"
                              fullWidth
                              color="success"
                              variant="contained"
                              disabled={
                                inputs.newPass === `` ||
                                inputs.confirmedNewPass === `` ||
                                inputs.newPass !== inputs.confirmedNewPass ||
                                inputs.newPass.length < 8 ||
                                inputs.newPass === inputs.oldPass
                              }
                            >
                              <FontAwesomeIcon
                                icon={faSave}
                                style={{ marginRight: 5 }}
                              />
                              <span>บันทึก</span>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </Flex>
            </form>
          </Container>
        </>
      ) : (
        <>
          <PageNotFound />
        </>
      )}
    </Layout>
  )
}

export default SettingsGeneral
