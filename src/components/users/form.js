import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import {
  Button,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  Switch,
  IconButton,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faAt,
  faPlus,
  faSave,
  faTimes,
  faRedoAlt,
  faEye,
  faEyeSlash,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Warning from "../warning"
import { Form, Flex, CheckCircleFlex, TextFieldWall } from "../styles"
import WhoCreated from "../who-created"
import renderCheckingIcon from "../../functions/render-checking-icon"
import renderDivision from "../../functions/render-division"
import renderUserRole from "../../functions/render-user-role"
import renderValueForRelationField from "../../functions/render-value-for-relation-field"
import roleLevel from "../../functions/role-level"
import ranks from "../../static/ranks"

const textfieldProps = {
  width: `100%`,
}

const UserForm = ({ modification, id }) => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { units, roles } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [firstStrike, setFirstStrike] = useState(false)
  const [inputsError, setInputsError] = useState({
    username: false,
    email: false,
  })
  const [inputs, setInputs] = useState({
    rank: null,
    name: ``,
    surname: ``,
    userPosition: ``,
    username: ``,
    password: ``,
    email: ``,
    division: null,
    role: null,
    isConfirmed: false,
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
  const [isError, setIsError] = useState({
    status: ``,
    text: ``,
  })
  const [pwdVisibility, setPwdVisibility] = useState(false)

  const getUser = useCallback(async () => {
    if (id === `0`) {
      setIsError({
        status: `notfound`,
        text: `ไม่พบข้อมูลผู้ใช้งาน`,
      })

      return 0
    }

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
          query User {
            user(id: "${id}") {
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
         }
        `,
      })

      const userData = res.data.user

      if (userData) {
        setFirstStrike(true)
        setInputs(prev => ({
          ...prev,
          rank: ranks.find(elem => elem.shortName === userData.rank) || null,
          name: userData.name || ``,
          surname: userData.surname || ``,
          userPosition: userData.userPosition || ``,
          username: userData.username || ``,
          password: ``,
          email: userData.email || ``,
          division:
            userData.division !== null
              ? units.find(elem => elem._id === userData.division._id)
              : null,
          role:
            userData.role !== null
              ? roles.find(elem => elem._id === userData.role._id)
              : null,
          isConfirmed: userData.confirmed || false,
        }))

        setAgents({
          whoCreated: {
            id: userData.staff_created,
            date: new Date(userData.createdAt),
          },
          whoUpdated: {
            id: userData.staff_updated,
            date: new Date(userData.updatedAt),
          },
        })
      }
    } catch (error) {
      console.log(error.message)

      setIsError({
        status: `notfound`,
        text: `ไม่พบข้อมูลผู้ใช้งาน`,
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, dispatch, id, units, roles])

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
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const res = await client(token).mutate({
        mutation: gql`
          mutation CreateUser {
            createUser(input: {
              data: {
                username: "${inputs.username}",
                rank: "${inputs.rank.shortName}",
                name: "${inputs.name}",
                surname: "${inputs.surname}",
                userPosition: "${inputs.userPosition}",
                email: "${inputs.email}",
                password: "${inputs.password}",
                confirmed: ${inputs.isConfirmed},
                blocked: false,
                division: ${renderValueForRelationField(inputs.division)},
                role: ${renderValueForRelationField(inputs.role)},
                staff_created: "${userInfo._id}",
                staff_updated: "",
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

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }

  const goEdit = async () => {
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const changedPasswordPayload =
        inputs.password !== `` ? `password: "${inputs.password}",` : ``
      const res = await client(token).mutate({
        mutation: gql`
          mutation UpdateUser {
            updateUser(input: {
              where: {
                id: "${id}"
              }
              data: {
                rank: "${inputs.rank.shortName}",
                name: "${inputs.name}",
                surname: "${inputs.surname}",
                userPosition: "${inputs.userPosition}",
                confirmed: ${inputs.isConfirmed},
                division: ${renderValueForRelationField(inputs.division)},
                role: ${renderValueForRelationField(inputs.role)},
                staff_updated: "${userInfo._id}",
                ${changedPasswordPayload}
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
      const editedUserId = res.data.updateUser.user._id

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การบันทึกข้อมูล`,
          description: `แก้ไขข้อมูลผู้ใช้งานสำเร็จ`,
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
                description: "users -> save -> ${editedUserId}",
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
          description: `ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้`,
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

  const clearInputs = () => {
    setInputs({
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
    if (token !== ``) {
      if (modification) {
        getUser()
      }
    }
  }, [token, modification, getUser])

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
    <>
      {(modification && firstStrike) || !modification ? (
        <>
          <Form
            onSubmit={e => {
              e.preventDefault()

              !modification ? goAdd() : goEdit()
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
              <Grid item xs={12}>
                <TextField
                  sx={textfieldProps}
                  id="user-position"
                  label="ตำแหน่ง"
                  variant="outlined"
                  onChange={e => {
                    setInputs({
                      ...inputs,
                      userPosition: e.target.value,
                    })
                  }}
                  value={inputs.userPosition}
                />
              </Grid>
            </Grid>
            <Divider
              style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {!modification ? (
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
                      inputsError.username
                        ? `ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว`
                        : ``
                    }
                  />
                ) : (
                  <TextField
                    sx={textfieldProps}
                    label="ชื่อผู้ใช้งาน"
                    variant="outlined"
                    value={inputs.username}
                    disabled
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  type={!pwdVisibility ? `password` : `text`}
                  id="password"
                  label="รหัสผ่าน"
                  variant="outlined"
                  onChange={e => {
                    setInputs({
                      ...inputs,
                      password: e.target.value,
                    })
                  }}
                  value={inputs.password}
                  InputProps={{
                    endAdornment: (
                      <>
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
                        {!modification
                          ? renderCheckingIcon(
                              inputs.password !== `` &&
                                inputs.password.length >= 8
                            )
                          : inputs.password !== `` &&
                            inputs.password.length >= 8
                          ? renderCheckingIcon(true)
                          : ``}
                      </>
                    ),
                  }}
                  helperText={
                    modification
                      ? inputs.password !== `` && inputs.password.length < 8
                        ? `ต้องมีจำนวน 8 อักขระขึ้นไป`
                        : `กรณีไม่เปลี่ยนแปลงรหัสผ่าน ให้เว้นว่างไว้`
                      : ``
                  }
                />
              </Grid>
              <Grid item xs={12}>
                {!modification ? (
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
                      inputsError.email ? `อีเมลนี้ถูกใช้งานแล้ว` : ``
                    }
                  />
                ) : (
                  <TextField
                    sx={textfieldProps}
                    label="อีเมล"
                    variant="outlined"
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
                    }}
                    disabled
                  />
                )}
              </Grid>
            </Grid>
            <Divider
              style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
            />
            <Grid container spacing={2}>
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
                    options={roles}
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
            <Divider
              style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
            />
            <TextFieldWall
              style={{
                padding: `6px 12px`,
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

            <div style={{ marginBottom: `1rem` }} />
            <Grid container spacing={2}>
              <Grid item md={6} sm={12} xs={12}>
                {!modification ? (
                  <Button
                    fullWidth
                    color="success"
                    variant="contained"
                    type="submit"
                    disabled={
                      inputs.rank === null ||
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
                ) : (
                  <Button
                    fullWidth
                    color="success"
                    variant="contained"
                    type="submit"
                    disabled={
                      inputs.rank === null ||
                      inputs.name === `` ||
                      inputs.surname === `` ||
                      (inputs.password !== `` && inputs.password.length < 8) ||
                      inputs.division === null ||
                      inputs.role === null
                    }
                  >
                    <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
                    บันทึก
                  </Button>
                )}
              </Grid>
              <Grid item md={6} sm={12} xs={12}>
                {!modification ? (
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
                      inputs.division === null &&
                      inputs.role === null &&
                      inputs.isConfirmed === false
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ marginRight: 5 }}
                    />
                    ล้าง
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    color="primary"
                    variant="outlined"
                    type="reset"
                    onClick={() => getUser()}
                  >
                    <FontAwesomeIcon
                      icon={faRedoAlt}
                      style={{ marginRight: 5 }}
                    />
                    โหลดข้อมูลใหม่
                  </Button>
                )}
              </Grid>
            </Grid>
          </Form>

          {modification && roleLevel(userInfo.role) >= 2 && (
            <>
              <Divider style={{ margin: `2rem auto`, width: `100%` }} />
              <WhoCreated
                whoCreated={agents.whoCreated}
                whoUpdated={agents.whoUpdated}
              />
            </>
          )}
        </>
      ) : (
        <>
          {isError.status === `notfound` && (
            <Warning
              text="ไม่พบ url ที่ท่านเรียกหรือเนื้อหาในส่วนนี้ได้ถูกลบออกจากระบบ"
              variant="notfound"
              button={
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(`/users/`)}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    style={{ marginRight: 5 }}
                  />
                  <span>กลับไปหน้าจัดการผู้ใช้งาน</span>
                </Button>
              }
            />
          )}
        </>
      )}
    </>
  )
}

UserForm.propTypes = {
  modification: PropTypes.bool,
  id: PropTypes.string,
}

UserForm.defaultProps = {
  modification: false,
}

export default UserForm
