import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Grid, Button, Alert, TextField, Divider, Switch } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import {
  Form,
  SubmitButtonFlex,
  Flex,
  TextFieldWall,
} from "../../components/styles"
import renderDivision from "../../functions/render-division"
import checkPid from "../../functions/check-pid"
import roles from "../../static/roles"

const Oparator = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
`

const PositionsPage = () => {
  const { token, userInfo, searchPersonFilter, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { units } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: `disabled`,
    text: `กำลังตรวจสอบคลังตำแหน่ง...`,
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
                description: "people",
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

  const getPositions = useCallback(async () => {
    let role = ``

    if (roles[userInfo.role.name].level <= 1) {
      if (userInfo.division === null) {
        const clearSession = async () => {
          dispatch({
            type: `SET_TOKEN`,
            token: ``,
          })

          dispatch({
            type: `SET_SESSION_TIMER`,
            sessionTimer: {
              hr: `08`,
              min: `00`,
              sec: `00`,
            },
          })
        }

        await clearSession()
        await navigate(`/`)

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

        try {
          await client(token).mutate({
            mutation: gql`
              mutation CreateLog {
                createLog(input: {
                  data: {
                    action: "auth",
                    description: "division is null",
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
        }

        return 0
      }

      role = `division: "${userInfo.division._id}"`
    }

    savePageView()

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
          query PositionsCount {
            positionsConnection(where: {
              isOpen: true
              ${role}
              person_null: true
            }) {
              aggregate {
                count
              }
            }
          }
        `,
      })

      const totalCount = res.data.positionsConnection.aggregate.count

      if (totalCount > 0) {
        setIsError({
          status: ``,
          text: `มีตำแหน่งว่าง${
            roles[userInfo.role.name].level > 1 ? `ทั้ง ทบ.` : ``
          } ${totalCount} ตำแหน่ง`,
        })
      } else {
        setIsError({
          status: `notfound`,
          text: `ไม่มีตำแหน่งว่าง`,
        })
      }
    } catch (error) {
      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPositions(),
          },
        })
      }

      return 0
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, userInfo, savePageView, dispatch])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

  useEffect(() => {
    if (token !== ``) {
      getPositions()
    }
  }, [getPositions, token])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo
            title={
              roles[userInfo.role.name].level <= 1
                ? `จัดการประวัติกำลังพล (${
                    userInfo.division !== null
                      ? renderDivision(userInfo.division)
                      : `-`
                  })`
                : `จัดการประวัติกำลังพล`
            }
          />
          <Breadcrumbs
            current={
              roles[userInfo.role.name].level <= 1
                ? `จัดการประวัติกำลังพล (${
                    userInfo.division !== null
                      ? renderDivision(userInfo.division)
                      : `-`
                  })`
                : `จัดการประวัติกำลังพล`
            }
          />

          <Oparator>
            {isError.status === `disabled` && (
              <Alert sx={{ width: `100%`, marginRight: `10px` }} icon={false}>
                {isError.text}
              </Alert>
            )}
            {isError.status === `notfound` && (
              <Alert
                sx={{ width: `100%`, marginRight: `10px` }}
                severity="error"
              >
                {isError.text}
              </Alert>
            )}
            {isError.status === `` && (
              <Alert
                sx={{ width: `100%`, marginRight: `10px` }}
                severity="success"
              >
                {isError.text}
              </Alert>
            )}

            <Button
              sx={{
                minWidth: 120,
                whiteSpace: `nowrap`,
              }}
              color="success"
              variant="outlined"
              disabled={
                isError.status === `disabled` || isError.status === `notfound`
              }
              onClick={() => {
                navigate(`/people/add/`)
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
              เพิ่มกำลังพล
            </Button>
          </Oparator>
          <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
          <Form onSubmit={e => e.preventDefault()}>
            <Grid
              container
              spacing={2}
              sx={{
                alignItems: `center`,
                justifyContent: `center`,
              }}
            >
              <Grid
                item
                xs={12}
                sm={6}
                style={{
                  display: `flex`,
                  flexDirection: `column`,
                }}
              >
                <TextField
                  sx={{ marginBottom: `1rem` }}
                  id="person-name"
                  label="ชื่อ"
                  variant="outlined"
                  onChange={e => {
                    dispatch({
                      type: `SET_SEARCH_PERSON_FILTER`,
                      searchPersonFilter: {
                        ...searchPersonFilter,
                        personName: e.target.value,
                      },
                    })
                  }}
                  value={searchPersonFilter.personName}
                />
                <TextField
                  sx={{ marginBottom: `1rem` }}
                  id="person-surname"
                  label="สกุล"
                  variant="outlined"
                  onChange={e => {
                    dispatch({
                      type: `SET_SEARCH_PERSON_FILTER`,
                      searchPersonFilter: {
                        ...searchPersonFilter,
                        personSurname: e.target.value,
                      },
                    })
                  }}
                  value={searchPersonFilter.personSurname}
                />
                <TextField
                  sx={{ marginBottom: `1rem` }}
                  id="person-id"
                  label="หมายเลขประจำตัวประชาชน (13 หลัก)"
                  variant="outlined"
                  onChange={e => {
                    const newValue = e.target.value
                    const pattern = /[0-9]/g
                    const result = newValue.match(pattern)

                    if (result !== null) {
                      const newIdCard = result.toString().replaceAll(`,`, ``)

                      if (newIdCard.length <= 13) {
                        dispatch({
                          type: `SET_SEARCH_PERSON_FILTER`,
                          searchPersonFilter: {
                            ...searchPersonFilter,
                            personId: newIdCard,
                          },
                        })
                      }
                    } else {
                      dispatch({
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
                          personId: ``,
                        },
                      })
                    }
                  }}
                  value={searchPersonFilter.personId}
                  error={
                    searchPersonFilter.personId.length === 13 &&
                    !checkPid(searchPersonFilter.personId)
                  }
                />
                <TextField
                  sx={{ marginBottom: `1rem` }}
                  id="person-sid"
                  label="หมายเลขประจำตัวข้าราชการกองทัพบก (10 หลัก)"
                  variant="outlined"
                  onChange={e => {
                    const newValue = e.target.value
                    const pattern = /[0-9]/g
                    const result = newValue.match(pattern)

                    if (result !== null) {
                      const newSidCard = result.toString().replaceAll(`,`, ``)

                      if (newSidCard.length <= 10) {
                        dispatch({
                          type: `SET_SEARCH_PERSON_FILTER`,
                          searchPersonFilter: {
                            ...searchPersonFilter,
                            personSid: newSidCard,
                          },
                        })
                      }
                    } else {
                      dispatch({
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
                          personSid: ``,
                        },
                      })
                    }
                  }}
                  value={searchPersonFilter.personSid}
                />
                <TextField
                  sx={{ marginBottom: `1rem` }}
                  id="pos-number"
                  label="เลขที่ตำแหน่ง"
                  variant="outlined"
                  onChange={e => {
                    const newValue = e.target.value
                    const pattern = /[0-9]/g
                    const result = newValue.match(pattern)

                    if (result !== null) {
                      const newPosNumber = result.toString().replaceAll(`,`, ``)

                      dispatch({
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
                          posNumber: newPosNumber,
                        },
                      })
                    } else {
                      dispatch({
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
                          posNumber: ``,
                        },
                      })
                    }
                  }}
                  value={searchPersonFilter.posNumber}
                />
                <Flex style={{ marginBottom: `1rem` }}>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="person-type"
                    disablePortal
                    options={[`พนักงานราชการ`, `ลูกจ้างประจำ`]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        dispatch({
                          type: `SET_SEARCH_PERSON_FILTER`,
                          searchPersonFilter: {
                            ...searchPersonFilter,
                            personType: newValue,
                          },
                        })
                      } else {
                        dispatch({
                          type: `SET_SEARCH_PERSON_FILTER`,
                          searchPersonFilter: {
                            ...searchPersonFilter,
                            personType: ``,
                          },
                        })
                      }
                    }}
                    value={
                      searchPersonFilter.personType !== ``
                        ? searchPersonFilter.personType
                        : null
                    }
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ประเภท"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                </Flex>
                {roles[userInfo.role.name].level > 1 && (
                  <Flex style={{ marginBottom: `1rem` }}>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="position-name"
                      disablePortal
                      options={units}
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => {
                        let label = ``

                        if (option.division1) {
                          label = option.division1
                        }

                        if (option.division2) {
                          label = option.division2
                        }

                        if (option.division3) {
                          label = option.division3
                        }
                        return label
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        if (newValue !== null) {
                          dispatch({
                            type: `SET_SEARCH_PERSON_FILTER`,
                            searchPersonFilter: {
                              ...searchPersonFilter,
                              unit: newValue,
                            },
                          })
                        } else {
                          dispatch({
                            type: `SET_SEARCH_PERSON_FILTER`,
                            searchPersonFilter: {
                              ...searchPersonFilter,
                              unit: null,
                            },
                          })
                        }
                      }}
                      value={searchPersonFilter.unit}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="สังกัด"
                          InputProps={{
                            ...params.InputProps,
                          }}
                        />
                      )}
                    />
                  </Flex>
                )}
                <Divider style={{ margin: `0 auto 1rem auto`, width: 300 }} />
                <TextFieldWall
                  style={{
                    padding: `6px 12px`,
                    marginBottom: `1rem`,
                    cursor: `pointer`,
                    userSelect: `none`,
                    backgroundColor: searchPersonFilter.isResigned
                      ? primaryColor[50]
                      : `rgba(0, 0, 0, 0)`,
                    border: searchPersonFilter.isResigned
                      ? `1px solid ${primaryColor[500]}`
                      : `1px solid rgba(0, 0, 0, 0.24)`,
                  }}
                  role="presentation"
                  onClick={() =>
                    dispatch({
                      type: `SET_SEARCH_PERSON_FILTER`,
                      searchPersonFilter: {
                        ...searchPersonFilter,
                        isResigned: !searchPersonFilter.isResigned,
                      },
                    })
                  }
                >
                  <Flex
                    style={{ width: `100%`, justifyContent: `space-between` }}
                  >
                    <div style={{ color: `rgba(0, 0, 0, 0.6)` }}>
                      ที่จำหน่ายสูญเสีย
                    </div>
                    <Switch checked={searchPersonFilter.isResigned} />
                  </Flex>
                </TextFieldWall>
              </Grid>
              <Grid item xs={12} sm={6}>
                <SubmitButtonFlex>
                  <Button
                    style={{ marginRight: 10 }}
                    color="error"
                    variant="outlined"
                    type="reset"
                    onClick={() => {
                      dispatch({
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
                          personName: ``,
                          personSurname: ``,
                          personId: ``,
                          personSid: ``,
                          personType: ``,
                          posNumber: ``,
                          unit: null,
                          isResigned: false,
                        },
                      })
                    }}
                    disabled={
                      searchPersonFilter.personName === `` &&
                      searchPersonFilter.personSurname === `` &&
                      searchPersonFilter.personId === `` &&
                      searchPersonFilter.personSid === `` &&
                      searchPersonFilter.personType === `` &&
                      searchPersonFilter.posNumber === `` &&
                      searchPersonFilter.unit === null &&
                      searchPersonFilter.isResigned === false
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ marginRight: 5 }}
                    />
                    ล้าง
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                      dispatch({
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
                          currentPage: 0,
                        },
                      })
                      navigate(
                        !searchPersonFilter.isResigned
                          ? `/people/list/`
                          : `/people/resigned-list/`
                      )
                    }}
                    disabled={
                      searchPersonFilter.personId.length === 13 &&
                      !checkPid(searchPersonFilter.personId)
                    }
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ marginRight: 5 }}
                    />
                    ค้นหา
                  </Button>
                </SubmitButtonFlex>
              </Grid>
            </Grid>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
