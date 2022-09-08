import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import {
  IconButton,
  Button,
  Grid,
  Autocomplete,
  TextField,
  Divider,
  InputAdornment,
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTimes,
  faEye,
  faEyeSlash,
  faAt,
  faPaperPlane,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../functions/apollo-client"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import PageNotFound from "../components/page-not-found"
import { Form, Flex, CheckCircleFlex } from "../components/styles"
import Registration from "../components/registration"
import renderCheckingIcon from "../functions/render-checking-icon"
import renderDivision from "../functions/render-division"
import renderValueForRelationField from "../functions/render-value-for-relation-field"
import ranks from "../static/ranks"
import Warning from "../components/warning"
import checkPid from "../functions/check-pid"

const Container = styled.div`
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 24px;
  padding: 2rem 1.5rem;
  max-width: 800px;
  margin: auto;
`

const Content = styled(Flex)`
  flex-direction: column;
`

const textfieldProps = {
  width: `100%`,
}

const initialStates = {
  rank: null,
  name: ``,
  surname: ``,
  position: ``,
  username: ``,
  password: ``,
  email: ``,
  division: null,
}

const RegistrationPage = () => {
  const { token } = useSelector(({ mainReducer }) => mainReducer)
  const { serverStates } = useSelector(
    ({ registrationReducer }) => registrationReducer
  )
  const dispatch = useDispatch()

  const [firstStrike, setFirstStrike] = useState(false)
  const [divisions, setDivisions] = useState([])
  const [inputsError, setInputsError] = useState({
    username: false,
    email: false,
  })
  const [inputs, setInputs] = useState(initialStates)
  const [pwdVisibility, setPwdVisibility] = useState(false)

  const checkUsernameIsExists = useCallback(async () => {
    if (inputs.username !== ``) {
      try {
        const res = await client().query({
          query: gql`
            query UsernameChecking {
              users(where: {
                username: "${inputs.username}"
              }) {
                _id
              }
            }
          `,
        })

        if (res.data.users.length > 0) {
          setInputsError(prev => ({
            ...prev,
            username: true,
          }))
          return true
        }
      } catch {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `การส่งข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ`,
            variant: `error`,
            confirmText: `เชื่อมจ่ออีกครั้ง`,
            callback: () => checkUsernameIsExists(),
          },
        })
        return false
      }

      try {
        const res = await client().query({
          query: gql`
            query Registrations {
              registrations(where: {
                username: "${inputs.username}"
              }) {
                _id
              }
            }
          `,
        })

        if (res.data.registrations.length > 0) {
          setInputsError(prev => ({
            ...prev,
            username: true,
          }))
          return true
        }
      } catch {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `การส่งข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ`,
            variant: `error`,
            confirmText: `เชื่อมจ่ออีกครั้ง`,
            callback: () => checkUsernameIsExists(),
          },
        })
        return false
      }
    }

    setInputsError(prev => ({
      ...prev,
      username: false,
    }))
    return false
  }, [inputs.username, dispatch])

  const checkEmailIsExists = useCallback(async () => {
    if (inputs.email !== ``) {
      try {
        const res = await client().query({
          query: gql`
            query EmailChecking {
              users(where: {
                email: "${inputs.email}"
              }) {
                _id
              }
            }
          `,
        })

        if (res.data.users.length > 0) {
          setInputsError(prev => ({
            ...prev,
            email: true,
          }))
          return true
        }
      } catch {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `การส่งข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ`,
            variant: `error`,
            confirmText: `เชื่อมจ่ออีกครั้ง`,
            callback: () => checkEmailIsExists(),
          },
        })
        return false
      }

      try {
        const res = await client().query({
          query: gql`
            query Registrations {
              registrations(where: {
                email: "${inputs.email}"
              }) {
                _id
              }
            }
          `,
        })

        if (res.data.registrations.length > 0) {
          setInputsError(prev => ({
            ...prev,
            email: true,
          }))
          return true
        }
      } catch {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `การส่งข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ`,
            variant: `error`,
            confirmText: `เชื่อมจ่ออีกครั้ง`,
            callback: () => checkEmailIsExists(),
          },
        })
        return false
      }
    }

    setInputsError(prev => ({
      ...prev,
      email: false,
    }))
    return false
  }, [inputs.email, dispatch])

  const goRegister = async () => {
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const res = await client().query({
        query: gql`
          query Registrations {
            registrations(where: {
              username: "${inputs.username}"
            }) {
              _id
              username
            }
          }
        `,
      })

      const { data } = res

      if (data.registrations.length > 0) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การลงทะเบียนผู้ใช้งานไม่สำเร็จ`,
            description: `หมายเลขประจำตัวประชาชนนี้ ได้ลงทะเบียนไว้แล้ว`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => {
              checkUsernameIsExists()
            },
          },
        })
      }
    } catch (error) {
      // console.log(error.message)

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การลงทะเบียนผู้ใช้งานไม่สำเร็จ`,
          description: `การส่งข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ`,
          variant: `error`,
          confirmText: `ตกลง`,
          callback: () => {},
        },
      })

      return 0
    }

    try {
      const res = await client().mutate({
        mutation: gql`
          mutation CreateRegistration {
            createRegistration(input: {
              data: {
                username: "${inputs.username}",
                password: "${inputs.password}",
                email: "${inputs.email}",
                rank: "${inputs.rank.shortName}",
                name: "${inputs.name}",
                surname: "${inputs.surname}",
                division: ${renderValueForRelationField(inputs.division)},
                is_approved: false,
              }
            }) {
              registration {
                _id
              }
            }
          }
        `,
      })

      console.log(res)
      // const createdUserId = res.data.createUser.user._id

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การลงทะเบียนผู้ใช้งาน`,
          description: `ส่งข้อมูลสำเร็จ`,
          variant: `success`,
          confirmText: `ตกลง`,
          callback: () => navigate(`/`),
        },
      })
    } catch (error) {
      console.log(error.message)

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การลงทะเบียนผู้ใช้งานไม่สำเร็จ`,
          description: `การส่งข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ`,
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

  const getDivisions = useCallback(async () => {
    let lap = 0

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const res = await client().query({
        query: gql`
          query DivisionsCount {
            divisionsConnection {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.divisionsConnection.aggregate.totalCount
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getDivisions(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client().query({
          query: gql`
            query Divisions {
              divisions(limit: 100, start: ${i * 100}) {
                _id
                division1
                division2
                division3
              }
            }
          `,
        })

        for (let division of res.data.divisions) {
          returnData = [...returnData, division]
        }
      }

      setDivisions(returnData)
      setFirstStrike(true)
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [dispatch])

  const clearInputs = () => {
    setInputs(initialStates)
  }

  const renderCheckingIconForUsernameAndEmail = (value, error) => {
    if (value !== ``) {
      if (!error) {
        return `pass`
      }

      return `warning`
    }

    return ``
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `registration`,
    })
  }, [dispatch])

  useEffect(() => {
    getDivisions()
  }, [getDivisions])

  useEffect(() => {
    if (inputs.username.length === 13 && checkPid(inputs.username)) {
      checkUsernameIsExists()
    }
  }, [checkUsernameIsExists, inputs.username])

  useEffect(() => {
    const myInterval = setTimeout(() => {
      checkEmailIsExists()
    }, 500)

    return () => clearTimeout(myInterval)
  }, [checkEmailIsExists])

  return (
    <Layout>
      {token === `` ? (
        <>
          <Seo title="ลงทะเบียนผู้ใช้งาน" />
          <Breadcrumbs
            previous={[
              {
                name: `หน้าแรก`,
                link: `/`,
              },
            ]}
            current="ลงทะเบียนผู้ใช้งาน"
          />
          <Registration />

          {firstStrike &&
            (() => {
              const ErrorContent = ({ text }) => (
                <Warning
                  text={text}
                  button={
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => navigate(`/`)}
                    >
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        style={{ marginRight: 5 }}
                      />
                      <span>กลับหน้าแรก</span>
                    </Button>
                  }
                />
              )

              if (serverStates.isOnline) {
                if (serverStates.isOpenToRegistration) {
                  return (
                    <Container>
                      <Content>
                        <Form
                          onSubmit={e => {
                            e.preventDefault()

                            goRegister()
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Flex>
                                <Autocomplete
                                  sx={{ width: `100%` }}
                                  id="rank"
                                  disablePortal
                                  options={ranks}
                                  noOptionsText={`ไม่พบข้อมูล`}
                                  getOptionLabel={option => option.shortName}
                                  isOptionEqualToValue={(option, value) => {
                                    return option === value
                                  }}
                                  onChange={(_, newValue) => {
                                    setInputs(prev => ({
                                      ...prev,
                                      rank: newValue,
                                    }))
                                  }}
                                  value={inputs.rank}
                                  renderInput={params => (
                                    <TextField
                                      {...params}
                                      label="* ยศ"
                                      InputProps={{
                                        ...params.InputProps,
                                        sx: {
                                          borderRadius: `5px 0 0 5px`,
                                        },
                                      }}
                                    />
                                  )}
                                />
                                <CheckCircleFlex>
                                  {renderCheckingIcon(inputs.rank)}
                                </CheckCircleFlex>
                              </Flex>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                sx={textfieldProps}
                                id="name"
                                label="* ชื่อ"
                                variant="outlined"
                                onChange={e => {
                                  setInputs(prev => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }}
                                value={inputs.name}
                                InputProps={{
                                  endAdornment: renderCheckingIcon(inputs.name),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                sx={textfieldProps}
                                id="surname"
                                label="* สกุล"
                                variant="outlined"
                                onChange={e => {
                                  setInputs(prev => ({
                                    ...prev,
                                    surname: e.target.value,
                                  }))
                                }}
                                value={inputs.surname}
                                InputProps={{
                                  endAdornment: renderCheckingIcon(
                                    inputs.surname
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                sx={textfieldProps}
                                id="user-position"
                                label="ตำแหน่ง"
                                variant="outlined"
                                onChange={e => {
                                  setInputs(prev => ({
                                    ...prev,
                                    position: e.target.value,
                                  }))
                                }}
                                value={inputs.position}
                              />
                            </Grid>
                          </Grid>
                          <Divider
                            style={{
                              margin: `2rem auto`,
                              width: `100%`,
                              maxWidth: 360,
                            }}
                          />
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                sx={textfieldProps}
                                id="username"
                                label="* หมายเลขประจำตัวประชาชน (ชื่อผู้ใช้งาน)"
                                variant="outlined"
                                onChange={e => {
                                  const newValue = e.target.value
                                  const pattern = /[0-9]/g
                                  const result = newValue.match(pattern)

                                  if (result !== null) {
                                    const newIdCard = result
                                      .toString()
                                      .replaceAll(`,`, ``)

                                    if (newIdCard.length <= 13) {
                                      setInputsError(prev => ({
                                        ...prev,
                                        username: false,
                                      }))

                                      setInputs(prev => ({
                                        ...prev,
                                        username: newIdCard,
                                      }))
                                    }
                                  } else {
                                    setInputsError(prev => ({
                                      ...prev,
                                      username: false,
                                    }))

                                    setInputs(prev => ({
                                      ...prev,
                                      username: ``,
                                    }))
                                  }
                                }}
                                value={inputs.username}
                                error={
                                  inputs.username.length === 13 &&
                                  (!checkPid(inputs.username) ||
                                    inputsError.username)
                                }
                                InputProps={{
                                  endAdornment: renderCheckingIcon(
                                    (() => {
                                      if (inputs.username.length === 13) {
                                        if (inputsError.username) {
                                          return `warning`
                                        }

                                        if (checkPid(inputs.username)) {
                                          return inputs.username
                                        }
                                      }

                                      return ``
                                    })()
                                  ),
                                }}
                                helperText={(() => {
                                  if (inputs.username.length === 13) {
                                    if (!checkPid(inputs.username)) {
                                      return `หมายเลขประจำตัวประชาชนไม่ถูกต้อง`
                                    }

                                    if (inputsError.username) {
                                      return `หมายเลขประจำตัวประชาชนนี้ ได้ลงทะเบียนไว้แล้ว`
                                    }
                                  }

                                  return ``
                                })()}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                sx={textfieldProps}
                                type={!pwdVisibility ? `password` : `text`}
                                id="password"
                                label="รหัสผ่าน"
                                variant="outlined"
                                onChange={e => {
                                  setInputs(prev => ({
                                    ...prev,
                                    password: e.target.value,
                                  }))
                                }}
                                value={inputs.password}
                                InputProps={{
                                  endAdornment: (
                                    <>
                                      <IconButton
                                        onClick={() =>
                                          setPwdVisibility(!pwdVisibility)
                                        }
                                        color="inherit"
                                        style={{ width: 35, height: 35 }}
                                      >
                                        <FontAwesomeIcon
                                          icon={
                                            !pwdVisibility ? faEye : faEyeSlash
                                          }
                                          style={{ fontSize: 16 }}
                                        />
                                      </IconButton>
                                      {renderCheckingIcon(
                                        inputs.password !== `` &&
                                          inputs.password.length >= 8
                                      )}
                                    </>
                                  ),
                                }}
                                helperText={
                                  inputs.password !== `` &&
                                  inputs.password.length < 8
                                    ? `ต้องมีจำนวน 8 อักขระขึ้นไป`
                                    : ``
                                }
                                autoComplete="true"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                sx={textfieldProps}
                                id="email"
                                label="* อีเมล"
                                variant="outlined"
                                onChange={e => {
                                  setInputsError(prev => ({
                                    ...prev,
                                    email: false,
                                  }))

                                  setInputs(prev => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }}
                                value={inputs.email}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FontAwesomeIcon
                                        icon={faAt}
                                        style={{ fontSize: 20 }}
                                      />
                                    </InputAdornment>
                                  ),
                                  endAdornment: renderCheckingIcon(
                                    renderCheckingIconForUsernameAndEmail(
                                      inputs.email,
                                      inputsError.email
                                    )
                                  ),
                                }}
                                error={inputsError.email ? true : false}
                                helperText={
                                  inputsError.email
                                    ? `อีเมลนี้ถูกใช้งานแล้ว`
                                    : ``
                                }
                              />
                            </Grid>
                          </Grid>
                          <Divider
                            style={{
                              margin: `2rem auto`,
                              width: `100%`,
                              maxWidth: 360,
                            }}
                          />
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Flex>
                                <Autocomplete
                                  sx={{ width: `100%` }}
                                  id="division"
                                  disablePortal
                                  options={divisions}
                                  noOptionsText={`ไม่พบข้อมูล`}
                                  getOptionLabel={option =>
                                    renderDivision(option)
                                  }
                                  isOptionEqualToValue={(option, value) => {
                                    return option === value
                                  }}
                                  onChange={(_, newValue) => {
                                    setInputs(prev => ({
                                      ...prev,
                                      division: newValue,
                                    }))
                                  }}
                                  value={inputs.division}
                                  renderInput={params => (
                                    <TextField
                                      {...params}
                                      label="* สังกัด"
                                      InputProps={{
                                        ...params.InputProps,
                                        sx: {
                                          borderRadius: `5px 0 0 5px`,
                                        },
                                      }}
                                    />
                                  )}
                                />
                                <CheckCircleFlex>
                                  {renderCheckingIcon(inputs.division)}
                                </CheckCircleFlex>
                              </Flex>
                            </Grid>
                          </Grid>

                          <div style={{ marginBottom: `1rem` }} />
                          <Grid container spacing={2}>
                            <Grid item md={6} sm={12} xs={12} />
                            <Grid item md={3} sm={12} xs={12}>
                              <Button
                                fullWidth
                                color="success"
                                variant="contained"
                                type="submit"
                                disabled={
                                  inputs.rank === null ||
                                  inputs.name === `` ||
                                  inputs.surname === `` ||
                                  inputsError.username ||
                                  !checkPid(inputs.username) ||
                                  (inputs.password === `` &&
                                    inputs.password.length < 8) ||
                                  renderCheckingIconForUsernameAndEmail(
                                    inputs.email,
                                    inputsError.email
                                  ) !== `pass` ||
                                  inputs.division === null ||
                                  inputs.role === null
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faPaperPlane}
                                  style={{ marginRight: 5 }}
                                />
                                ส่งข้อมูล
                              </Button>
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                              <Button
                                fullWidth
                                color="error"
                                variant="outlined"
                                type="reset"
                                onClick={() => clearInputs()}
                                disabled={
                                  inputs.rank === null &&
                                  inputs.name === `` &&
                                  inputs.surname === `` &&
                                  inputs.username === `` &&
                                  inputs.password === `` &&
                                  inputs.email === `` &&
                                  inputs.division === null
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  style={{ marginRight: 5 }}
                                />
                                ล้าง
                              </Button>
                            </Grid>
                          </Grid>
                        </Form>
                      </Content>
                    </Container>
                  )
                }

                return <ErrorContent text="ระบบยังไม่เปิดให้ลงทะเบียน" />
              }

              return <ErrorContent text="ระบบยังไม่เปิดให้บริการ" />
            })()}
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default RegistrationPage
