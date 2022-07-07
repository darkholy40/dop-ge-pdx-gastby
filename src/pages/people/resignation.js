import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Button, TextField, Divider } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faChevronLeft } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import { Form, Flex, CheckCircleFlex } from "../../components/styles"
import renderDivision from "../../functions/render-division"
import renderCheckingIcon from "../../functions/render-checking-icon"
import roleLevel from "../../functions/role-level"

const Line = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`
const Label = styled.span`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
`

const Text = styled.span``

const ResignationPage = ({ location }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: ``,
    text: ``,
  })
  const [input, setInput] = useState({
    note: ``,
  })
  const [personData, setPersonData] = useState(null)
  const search = location.search.split("id=")
  const id = search[1] || `0`

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "people->resignation => ${id}",
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
  }, [token, userInfo, id])

  const getPerson = useCallback(async () => {
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
          query Positions {
            positions(where: {
              person: "${id}"
            }) {
              _id
              number
              person {
                _id
                Prename
                Name
                Surname
              }
              position_type {
                type
                name
              }
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

      if (res.data.positions.length > 0) {
        setPersonData(res.data.positions[0])
      } else {
        setIsError({
          status: `id-notfound`,
          text: `ไม่พบข้อมูลกำลังพลรายการนี้ หรือข้อมูลถูกลบออกจากระบบแล้ว`,
        })
      }
    } catch (error) {
      // console.log({
      //   function: `getPerson()`,
      //   message: error.message,
      // })

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPerson(),
          },
        })
      } else {
        setIsError({
          status: `id-notfound`,
          text: `ไม่พบข้อมูลกำลังพลรายการนี้ หรือข้อมูลถูกลบออกจากระบบแล้ว`,
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
  }, [id, token, dispatch])

  const goSaveResignation = async () => {
    let getPersonID = ``
    setIsError({
      status: ``,
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
      const resPosition = await client(token).query({
        query: gql`
          query Position {
            positions(where: {
              person: "${id}"
            }) {
              _id
            }
          }
        `,
      })

      const positionId = resPosition.data.positions[0]._id

      if (positionId !== undefined) {
        const res = await client(token).mutate({
          mutation: gql`
            mutation UpdatePerson {
              updatePerson(input: {
                where: {
                  id: "${id}"
                }
                data: {
                  isResigned: true,
                  resignationNote: "${input.note}",
                  position: "${positionId}",
                  staff_updated: "${userInfo._id}"
                }
              }) {
                person {
                  _id
                }
              }
            }
          `,
        })

        // console.log(res.data)

        if (res) {
          getPersonID = res.data.updatePerson.person._id
        }
      }
    } catch {
      setIsError({
        status: `id-notfound`,
        text: `ไม่พบข้อมูลกำลังพลรายการนี้ หรือข้อมูลถูกลบออกจากระบบแล้ว`,
      })

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การบันทึกข้อมูลไม่สำเร็จ`,
          description: `ไม่พบข้อมูลกำลังพลรายการนี้ หรือข้อมูลถูกลบออกจากระบบแล้ว`,
          variant: `error`,
          confirmText: `ตกลง`,
          callback: () => {},
        },
      })
    }

    let oldPositionId = ``
    let check = {
      pass1: false,
    }

    if (getPersonID !== ``) {
      // get position id เดิม
      try {
        const res = await client(token).query({
          query: gql`
            query Positions {
              positions(where: { person: "${getPersonID}" }) {
                _id
              }
            }
          `,
        })

        if (res.data.positions.length > 0) {
          oldPositionId = res.data.positions[0]._id
        }
      } catch {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การบันทึกข้อมูลไม่สำเร็จ`,
            description: `[Error002] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => goSaveResignation(),
          },
        })
      }

      if (oldPositionId !== ``) {
        // ลบ person_id เดิมออกจาก position table
        try {
          await client(token).mutate({
            mutation: gql`
              mutation UpdatePosition {
                updatePosition(input: {
                  where: {
                    id: "${oldPositionId}"
                  }
                  data: {
                    person: null
                  }
                }) {
                  position {
                    _id
                    person {
                      _id
                    }
                  }
                }
              }
            `,
          })

          check.pass1 = true
        } catch (error) {
          console.log(error.message)

          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `การบันทึกข้อมูลไม่สำเร็จ`,
              description: `[Error003] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
              variant: `error`,
              confirmText: `ลองอีกครั้ง`,
              callback: () => goSaveResignation(),
            },
          })
        }
      }

      if (check.pass1) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การบันทึกข้อมูล`,
            description: `จำหน่ายสูญเสียกำลังพลสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/people/list/`)
            },
          },
        })

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "people->resignation->save => ${getPersonID}",
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
      currentPage: `people`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    getPerson()
  }, [getPerson])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 1 ? (
        <>
          <Seo title="จำหน่ายสูญเสีย" />
          <Breadcrumbs
            previous={[
              {
                name:
                  roleLevel(userInfo.role) <= 1
                    ? `ประวัติกำลังพล (${renderDivision(userInfo.division)})`
                    : `ประวัติกำลังพล`,
                link: `/people/`,
              },
              {
                name: `ค้นหากำลังพล`,
                link: `/people/list/`,
              },
            ]}
            current="จำหน่ายสูญเสีย"
          />

          {personData !== null ? (
            <>
              <Form
                onSubmit={e => {
                  e.preventDefault()
                }}
                style={{ maxWidth: 400 }}
              >
                <Line>
                  <Label>ชื่อ</Label>
                  <Text>
                    {personData.person.Prename} {personData.person.Name}{" "}
                    {personData.person.Surname}
                  </Text>
                </Line>
                <Line>
                  <Label>ชื่อตำแหน่งในสายงาน</Label>
                  <Text>{personData.position_type.name}</Text>
                </Line>
                <Line>
                  <Label>ชื่อประเภทกลุ่มงาน</Label>
                  <Text>{personData.position_type.type}</Text>
                </Line>
                <Line>
                  <Label>เลขที่ตำแหน่ง</Label>
                  <Text>{personData.number}</Text>
                </Line>
                <Line>
                  <Label>สังกัด</Label>
                  <Text>{renderDivision(personData.division)}</Text>
                </Line>
              </Form>
              <Divider style={{ margin: `0 auto 1rem`, width: `100%` }} />
              <Form
                onSubmit={e => {
                  e.preventDefault()
                  goSaveResignation()
                }}
                style={{ maxWidth: 400 }}
              >
                <Flex style={{ marginBottom: `1rem` }}>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="resignation-note"
                    disablePortal
                    freeSolo
                    options={[
                      `ไปรับราชการ`,
                      `ทำงานเอกชน`,
                      `ประกอบอาชีพอิสระ`,
                      `ไม่ผ่านการประเมินผลการปฏิบัติงาน`,
                    ]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setInput({
                        ...input,
                        note: newValue !== null ? newValue : ``,
                      })
                    }}
                    value={input.note !== `` ? input.note : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* สาเหตุการออก"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            borderRadius: `5px 0 0 5px`,
                          },
                          onChange: e =>
                            setInput({
                              ...input,
                              note: e.target.value,
                            }),
                          disabled: isError.status === `id-notfound`,
                        }}
                      />
                    )}
                  />
                  <CheckCircleFlex>
                    {renderCheckingIcon(input.note)}
                  </CheckCircleFlex>
                </Flex>

                <Button
                  color="success"
                  variant="contained"
                  type="submit"
                  disabled={
                    input.note === `` || isError.status === `id-notfound`
                  }
                >
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
                  บันทึก
                </Button>
              </Form>
            </>
          ) : (
            <>
              {isError.status === `id-notfound` && (
                <Warning
                  text={isError.text}
                  variant="notfound"
                  button={
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => navigate(`/people/list/`)}
                    >
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        style={{ marginRight: 5 }}
                      />
                      <span>กลับไปหน้าค้นหากำลังพล</span>
                    </Button>
                  }
                />
              )}
            </>
          )}
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default ResignationPage
