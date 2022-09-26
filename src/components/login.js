import React, { useState } from "react"
import { navigate } from "gatsby"
import styled from "styled-components"
import { useSelector, useDispatch } from "react-redux"
import {
  TextField,
  InputAdornment,
  Button,
  Alert,
  IconButton,
  Divider,
  Checkbox,
  Collapse,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faRegistered,
  faBook,
  faCheck,
} from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import { red } from "@mui/material/colors"

import { client, gql } from "../functions/apollo-client"

import Image from "./image"
import { ColorButton, Flex as CheckboxFlex } from "./styles"
import Registration from "./registration"

const TitleFlex = styled.div`
  display: flex;
  flex-direction: column;
`

const Title = styled.p`
  font-size: 1.5rem;
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;

  &.primary {
    font-size: 2rem;
    font-weight: bold;
  }

  &.login-text {
    font-style: italic;
    margin-top: 0;
    margin-bottom: 2rem;
  }

  @media (max-width: 991px) {
    &.login-text {
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  @media (max-width: 599px) {
    font-size: 1.25rem;

    &.primary {
      font-size: 1.75rem;
    }
  }
`

const Flex = styled.div`
  width: 100%;
  margin: auto;
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 24px;
  box-shadow: rgb(0 0 0 / 10%) 0px 2px 4px, rgb(0 0 0 / 10%) 0px 8px 16px;

  .middle {
    display: flex;
    flex-direction: row;
  }

  @media (max-width: 991px) {
    .middle {
      flex-direction: column;
    }
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: row;
`

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 1rem;

  .col {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }

  @media (max-width: 991px) {
    flex-direction: column;

    .col {
      margin-bottom: 1rem;
    }
  }
`

const Row = styled.div`
  width: 100%;
  max-width: 600px;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
`

const LogoContainer = styled.div`
  max-width: 150px;
  margin: auto;

  @media (max-width: 991px) {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
`

const MyAlert = styled(Alert)`
  color: ${red[500]};
  margin-bottom: 1rem;

  .alert-text {
    margin: 0;
  }
`

const IndexPage = () => {
  const { userInfo, isRememberedPass, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { serverStates } = useSelector(
    ({ registrationReducer }) => registrationReducer
  )
  const dispatch = useDispatch()
  const [usernameInput, setUsernameInput] = useState(userInfo.username)
  const [passwordInput, setPasswordInput] = useState(isRememberedPass.val)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [pwdVisibility, setPwdVisibility] = useState(false)

  const goLogin = async () => {
    setIsError({
      status: false,
      text: ``,
    })
    setIsLoading(true)
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    // check if user was registered

    try {
      const res = await client().query({
        query: gql`
          query Registrations {
            registrations(where: {
              username: "${usernameInput}",
              is_approved: false,
              is_completed: false,
            }) {
              _id
              username
            }
          }
        `,
      })

      const { data } = res

      if (data.registrations.length > 0) {
        setIsError({
          status: true,
          text: `บัญชีของคุณ ยังไม่ได้รับการอนุมัติให้ใช้งาน`,
        })
        setIsLoading(false)
        dispatch({
          type: `SET_BACKDROP_OPEN`,
          backdropDialog: {
            open: false,
            title: ``,
          },
        })

        return 0
      }
    } catch {
      setIsError({
        status: true,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
      })
      setIsLoading(false)
      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropDialog: {
          open: false,
          title: ``,
        },
      })

      return 0
    }

    try {
      const res = await axios.post(`${process.env.GEPDX_API_URL}/auth/local`, {
        identifier: usernameInput,
        password: passwordInput,
      })

      // console.log(res)

      switch (res.status) {
        case 200:
          const userData = res.data.user
          const token = res.data.jwt

          if (userData.division === undefined || userData.division === null) {
            setIsError({
              status: true,
              text: `บัญชีผู้ใช้งานมีปัญหา`,
            })

            dispatch({
              type: `SET_NOTIFICATION_DIALOG`,
              notificationDialog: {
                open: true,
                title: `บัญชีผู้ใช้งานมีปัญหา`,
                description: `กรุณาติดต่อเจ้าหน้าที่ผู้ดูแลระบบ`,
                variant: `error`,
                confirmText: `ตกลง`,
                callback: () => {},
              },
            })

            await client(token).mutate({
              mutation: gql`
                mutation CreateLog {
                  createLog(input: {
                    data: {
                      action: "auth",
                      description: "division is null",
                      users_permissions_user: "${userData._id}",
                    }
                  }) {
                    log {
                      _id
                    }
                  }
                }
              `,
            })

            setIsLoading(false)
            dispatch({
              type: `SET_BACKDROP_OPEN`,
              backdropDialog: {
                open: false,
                title: ``,
              },
            })

            return 0
          }

          if (userData.confirmed) {
            setIsError({
              status: false,
              text: `pass`,
            })

            // use setTimeout() to prevent "Can't perform a React state update on an unmounted component"
            setTimeout(() => {
              client(token).mutate({
                mutation: gql`
                  mutation CreateLog {
                    createLog(input: {
                      data: {
                        action: "auth",
                        description: "login",
                        users_permissions_user: "${userData._id}",
                      }
                    }) {
                      log {
                        _id
                      }
                    }
                  }
                `,
              })

              dispatch({
                type: `SET_TOKEN`,
                token: token,
              })

              dispatch({
                type: `SET_USER_INFO`,
                userInfo: {
                  _id: userData._id,
                  rank: userData.rank,
                  name: userData.name,
                  surname: userData.surname,
                  userPosition: userData.userPosition,
                  username: userData.username,
                  email: userData.email,
                  confirmed: userData.confirmed,
                  blocked: userData.blocked,
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt,
                  division: userData.division || null,
                  role: userData.role || null,
                },
              })

              if (isRememberedPass.status) {
                dispatch({
                  type: `SET_IS_REMEMBERED_PASS`,
                  isRememberedPass: {
                    ...isRememberedPass,
                    val: passwordInput,
                  },
                })
              } else {
                dispatch({
                  type: `SET_IS_REMEMBERED_PASS`,
                  isRememberedPass: {
                    ...isRememberedPass,
                    val: ``,
                  },
                })
              }
            }, 0)
          } else {
            setIsError({
              status: true,
              text: `บัญชีนี้ถูกระงับการใช้งาน`,
            })
          }
          break

        default:
          setIsError({
            status: true,
            text: `Error - ${res.status}`,
          })
          break
      }
    } catch (error) {
      // console.log(error)
      const status = error.response !== undefined ? error.response.status : 0

      switch (status) {
        case 400:
          setIsError({
            status: true,
            text: `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง`,
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

    setIsLoading(false)
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }

  return (
    <>
      <Registration />
      <TitleFlex>
        <Title className="primary">
          โปรแกรมพนักงานราชการในระบบฐานข้อมูลกำลังพลอิเล็กทรอนิกส์
        </Title>
        <Title
          style={{
            color: primaryColor[700],
            fontStyle: `italic`,
            marginTop: 0,
          }}
          className="primary"
        >
          <span>GE-PDX</span>
          <span
            style={{
              fontSize: `1.25rem`,
              marginLeft: 10,
            }}
          >
            (Government Employee Personal Data Exchange)
          </span>
        </Title>
      </TitleFlex>
      <form
        style={{
          maxWidth: `960px`,
          margin: `auto`,
        }}
        onSubmit={e => {
          e.preventDefault()
          goLogin()
        }}
      >
        <Flex>
          {serverStates.isOnline && (
            <Title className="login-text">ลงชื่อเข้าใช้งานระบบ</Title>
          )}
          <div className="middle">
            <Column>
              <LogoContainer>
                <Image src="icon.png" />
              </LogoContainer>
            </Column>
            {serverStates.isOnline && (
              <Column>
                <Row>
                  <TextField
                    style={{
                      width: `100%`,
                      marginBottom: `1rem`,
                    }}
                    id="uname"
                    label="ชื่อผู้ใช้งาน"
                    type="text"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FontAwesomeIcon
                            icon={faUser}
                            style={{ fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    disabled={isLoading || isError.text === `pass`}
                  />
                  <TextField
                    style={{
                      width: `100%`,
                      marginBottom: `1rem`,
                    }}
                    id="pwd"
                    label="รหัสผ่าน"
                    type={!pwdVisibility ? `password` : `text`}
                    autoComplete="true"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FontAwesomeIcon
                            icon={faLock}
                            style={{ fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <IconButton
                          onClick={() => setPwdVisibility(!pwdVisibility)}
                          color="inherit"
                          style={{ width: 35, height: 35 }}
                        >
                          <FontAwesomeIcon
                            icon={!pwdVisibility ? faEye : faEyeSlash}
                            style={{ fontSize: 16 }}
                          />
                        </IconButton>
                      ),
                    }}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    disabled={isLoading || isError.text === `pass`}
                  />
                  <CheckboxFlex
                    style={{ justifyContent: `flex-end`, marginBottom: `1rem` }}
                  >
                    <Checkbox
                      onChange={(_, newValue) => {
                        dispatch({
                          type: `SET_IS_REMEMBERED_PASS`,
                          isRememberedPass: {
                            ...isRememberedPass,
                            status: newValue,
                          },
                        })
                      }}
                      checked={isRememberedPass.status}
                    />
                    <div
                      role="presentation"
                      style={{
                        cursor: `pointer`,
                        userSelect: `none`,
                      }}
                      onClick={() =>
                        dispatch({
                          type: `SET_IS_REMEMBERED_PASS`,
                          isRememberedPass: {
                            ...isRememberedPass,
                            status: !isRememberedPass.status,
                          },
                        })
                      }
                    >
                      จดจำรหัสผ่าน
                    </div>
                  </CheckboxFlex>
                  <Collapse
                    in={isRememberedPass.status && !isRememberedPass.gotIt}
                  >
                    <MyAlert
                      icon={false}
                      severity="error"
                      action={
                        <Button
                          sx={{
                            whiteSpace: `nowrap`,
                          }}
                          color="success"
                          variant="contained"
                          onClick={() =>
                            dispatch({
                              type: `SET_IS_REMEMBERED_PASS`,
                              isRememberedPass: {
                                ...isRememberedPass,
                                gotIt: true,
                              },
                            })
                          }
                        >
                          <FontAwesomeIcon
                            icon={faCheck}
                            style={{ marginRight: 5 }}
                          />
                          รับทราบ
                        </Button>
                      }
                    >
                      <p className="alert-text">
                        ไม่ควรเลือก "จดจำรหัสผ่าน" บนอุปกรณ์สาธารณะ
                      </p>
                      <p className="alert-text">
                        เพื่อความปลอดภัยของบัญชีผู้ใช้งานของท่าน
                      </p>
                    </MyAlert>
                  </Collapse>
                  <Button
                    style={{
                      width: `100%`,
                    }}
                    type="submit"
                    color="primary"
                    variant="contained"
                    size="large"
                    disabled={
                      usernameInput === `` ||
                      passwordInput === `` ||
                      isLoading ||
                      isError.text === `pass`
                    }
                  >
                    {!isLoading && isError.text !== `pass` ? (
                      <span>เข้าสู่ระบบ</span>
                    ) : (
                      <span>กำลังเข้าสู่ระบบ...</span>
                    )}
                  </Button>
                  {isError.status && (
                    <Alert
                      sx={{ marginTop: `1rem`, animation: `fadein 0.3s` }}
                      severity="error"
                    >
                      {isError.text}
                    </Alert>
                  )}
                </Row>
              </Column>
            )}
          </div>
          {!serverStates.isOnline && (
            <Alert
              sx={{ marginTop: `1rem`, animation: `fadein 0.3s` }}
              severity="error"
            >
              ปิดปรับปรุงเซิร์ฟเวอร์ - ระบบยังไม่เปิดให้บริการในขณะนี้
            </Alert>
          )}
          <Divider
            style={{ width: `calc(100% - 80px)`, margin: `2rem 1rem` }}
          />
          <ButtonColumn>
            {serverStates.isOnline && serverStates.isOpenToRegistration && (
              <>
                <div className="col">
                  <ColorButton
                    height="75px"
                    width="400px"
                    icon={
                      <FontAwesomeIcon
                        icon={faRegistered}
                        style={{ fontSize: `2.5rem`, marginRight: `1rem` }}
                      />
                    }
                    title="ลงทะเบียนผู้ใช้งาน"
                    onClick={() => navigate(`/registration/`)}
                  />
                </div>
              </>
            )}
            <div className="col">
              <ColorButton
                height="75px"
                width="400px"
                icon={
                  <FontAwesomeIcon
                    icon={faBook}
                    style={{ fontSize: `2.5rem`, marginRight: `1rem` }}
                  />
                }
                title="ดาวน์โหลดคู่มือการใช้งานระบบ GE-PDX"
                href="https://ge-pdx.rta.mi.th/public/user_manual_GE-PDX.pdf"
              />
            </div>
          </ButtonColumn>
        </Flex>
      </form>
    </>
  )
}

export default IndexPage
