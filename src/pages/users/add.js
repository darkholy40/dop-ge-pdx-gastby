import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import {
  Button,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  Switch,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faAt } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import {
  Form,
  Flex,
  CheckCircleFlex,
  TextFieldWall,
} from "../../components/styles"
import renderCheckingIcon from "../../functions/render-checking-icon"
import renderDivision from "../../functions/render-division"
import renderUserRole from "../../functions/render-user-role"
import renderValueForRelationField from "../../functions/render-value-for-relation-field"
import roles from "../../static/roles"
import ranks from "../../static/ranks"

const textfieldProps = {
  width: `100%`,
}

const AddUserPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { units } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [rolesData, setRolesData] = useState([])
  const [inputsError, setInputsError] = useState({
    username: false,
    email: false,
  })
  const [inputs, setInputs] = useState({
    rank: null,
    name: ``,
    surname: ``,
    username: ``,
    password: ``,
    email: ``,
    division: null,
    role: null,
    isConfirmed: false,
  })

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
                description: "positions -> add",
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

  const getRoles = useCallback(async () => {
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const res = await client(token).query({
        query: gql`
          query Roles {
            roles {
              _id
              name
            }
          }
        `,
      })
      let returnData = []

      if (res) {
        returnData = [
          ...returnData,
          res.data.roles.find(elem => elem.name === `Authenticated`),
        ]
        returnData = [
          ...returnData,
          res.data.roles.find(elem => elem.name === `Administrator`),
        ]
        setRolesData(returnData)
      }
    } catch (error) {
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
          description: `${error.message}`,
          variant: `error`,
          confirmText: `ตกลง`,
          callback: () => {
            getRoles()
          },
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
  }, [token, dispatch])

  const checkUsernameIsExists = useCallback(async () => {
    if (inputs.username !== ``) {
      try {
        const res = await client(token).query({
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
      } catch (error) {
        console.log(error.message)
      }
    }

    setInputsError(prev => ({
      ...prev,
      username: false,
    }))
    return false
  }, [token, inputs.username])

  const checkEmailIsExists = useCallback(async () => {
    if (inputs.email !== ``) {
      try {
        const res = await client(token).query({
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
      } catch (error) {
        console.log(error.message)
      }
    }

    setInputsError(prev => ({
      ...prev,
      email: false,
    }))
    return false
  }, [token, inputs.email])

  const goAdd = async () => {
    let posNumberIsExisted = false

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    if (!posNumberIsExisted) {
      try {
        const res = await client(token).mutate({
          mutation: gql`
            mutation CreateUser {
              createUser(input: {
                data: {
                  username: "${inputs.username}"
                  rank: "${inputs.rank.shortName}"
                  name: "${inputs.name}"
                  surname: "${inputs.surname}"
                  email: "${inputs.email}"
                  password: "${inputs.password}"
                  confirmed: ${inputs.isConfirmed}
                  blocked: false
                  division: ${renderValueForRelationField(inputs.division)}
                  role: ${renderValueForRelationField(inputs.role)}
                  staff_created: "${userInfo._id}"
                  staff_updated: ""
                }
              }) {
                user {
                  _id
                }
              }
            }
          `,
        })

        // console.log(res)
        const createdUserId = res.data.createUser.user._id

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเพิ่มข้อมูล`,
            description: `เพิ่มข้อมูลผู้ใช้งานสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/users/`)
            },
          },
        })

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "users -> create -> ${createdUserId}",
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
            title: `การเพิ่มข้อมูลไม่สำเร็จ`,
            description: `ไม่สามารถเพิ่มข้อมูลผู้ใช้งานได้`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => {},
          },
        })
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
      currentPage: `users`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (token !== ``) {
      getRoles()
    }
  }, [token, getRoles])

  useEffect(() => {
    const myInterval = setTimeout(() => {
      checkUsernameIsExists()
    }, 500)

    return () => clearTimeout(myInterval)
  }, [checkUsernameIsExists])

  useEffect(() => {
    const myInterval = setTimeout(() => {
      checkEmailIsExists()
    }, 500)

    return () => clearTimeout(myInterval)
  }, [checkEmailIsExists])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 3 ? (
        <>
          <Seo title="เพิ่มผู้ใช้งาน" />
          <Breadcrumbs
            previous={[
              {
                name: `จัดการผู้ใช้งาน`,
                link: `/users/`,
              },
            ]}
            current="เพิ่มผู้ใช้งาน"
          />

          <Form
            onSubmit={e => {
              e.preventDefault()
              goAdd()
            }}
          >
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
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
                      setInputs({
                        ...inputs,
                        rank: newValue,
                      })
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
                    setInputs({
                      ...inputs,
                      name: e.target.value,
                    })
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
                    setInputs({
                      ...inputs,
                      surname: e.target.value,
                    })
                  }}
                  value={inputs.surname}
                  InputProps={{
                    endAdornment: renderCheckingIcon(inputs.surname),
                  }}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="username"
                  label="* ชื่อผู้ใช้งาน"
                  variant="outlined"
                  onChange={e => {
                    setInputs({
                      ...inputs,
                      username: e.target.value,
                    })
                  }}
                  value={inputs.username}
                  InputProps={{
                    endAdornment: renderCheckingIcon(
                      renderCheckingIconForUsernameAndEmail(
                        inputs.username,
                        inputsError.username
                      )
                    ),
                  }}
                  error={inputsError.username ? true : false}
                  helperText={
                    inputsError.username ? `ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว` : ``
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  type="password"
                  id="password"
                  label="* รหัสผ่าน"
                  variant="outlined"
                  onChange={e => {
                    setInputs({
                      ...inputs,
                      password: e.target.value,
                    })
                  }}
                  value={inputs.password}
                  InputProps={{
                    endAdornment: renderCheckingIcon(
                      inputs.password !== `` && inputs.password.length >= 8
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={textfieldProps}
                  id="email"
                  label="* อีเมล"
                  variant="outlined"
                  onChange={e => {
                    setInputs({
                      ...inputs,
                      email: e.target.value,
                    })
                  }}
                  value={inputs.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faAt} style={{ fontSize: 20 }} />
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
                  helperText={inputsError.email ? `อีเมลนี้ถูกใช้งานแล้ว` : ``}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="division"
                    disablePortal
                    options={units}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => renderDivision(option)}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setInputs({
                        ...inputs,
                        division: newValue,
                      })
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
              <Grid item xs={12}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="role"
                    disablePortal
                    options={rolesData}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => renderUserRole(option.name)}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setInputs({
                        ...inputs,
                        role: newValue,
                      })
                    }}
                    value={inputs.role}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* ระดับผู้ใช้งาน"
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
                    {renderCheckingIcon(inputs.role)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <TextFieldWall
              style={{
                padding: `6px 12px`,
                marginBottom: `1rem`,
                cursor: `pointer`,
                userSelect: `none`,
                backgroundColor: inputs.isConfirmed
                  ? primaryColor[50]
                  : `rgba(0, 0, 0, 0)`,
                border: inputs.isConfirmed
                  ? `1px solid ${primaryColor[500]}`
                  : `1px solid rgba(0, 0, 0, 0.24)`,
              }}
              role="presentation"
              onClick={() =>
                setInputs({
                  ...inputs,
                  isConfirmed: !inputs.isConfirmed,
                })
              }
            >
              <Flex style={{ width: `100%`, justifyContent: `space-between` }}>
                <div style={{ color: `rgba(0, 0, 0, 0.6)` }}>เปิดการใช้งาน</div>
                <Switch checked={inputs.isConfirmed} />
              </Flex>
            </TextFieldWall>

            <Button
              color="success"
              variant="contained"
              type="submit"
              disabled={
                inputs.rank === `` ||
                inputs.name === `` ||
                inputs.surname === `` ||
                renderCheckingIconForUsernameAndEmail(
                  inputs.username,
                  inputsError.username
                ) !== `pass` ||
                (inputs.password === `` && inputs.password.length < 8) ||
                renderCheckingIconForUsernameAndEmail(
                  inputs.email,
                  inputsError.email
                ) !== `pass` ||
                inputs.division === null ||
                inputs.role === null
              }
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
              เพิ่มผู้ใช้งาน
            </Button>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default AddUserPage
