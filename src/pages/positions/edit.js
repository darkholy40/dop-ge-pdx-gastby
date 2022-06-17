import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Button, TextField, Checkbox, Divider, Alert } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { Form, Flex, CheckCircleFlex } from "../../components/styles"
import renderCheckingIcon from "../../functions/render-checking-icon"
import renderDivision from "../../functions/render-division"
import roles from "../../static/roles"

const EditPositionsPage = ({ location }) => {
  const { token, userInfo, positionTypes, positionNames, units } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [count, setCount] = useState(0)
  const [currentPosNumber, setCurrentPosNumber] = useState(``)
  const [isError, setIsError] = useState({
    type: ``,
    text: ``,
  })
  const [addPositionFilter, setAddPositionFilter] = useState({
    posId: ``,
    posName: ``,
    posType: ``,
    posNumber: ``,
    unit: null,
    posOpen: false,
    posSouth: false,
    haveABudget: true,
  })
  const search = location.search.split("id=")
  const id = search[1] || `0`

  // useEffect(() => {
  //   const search = location.search.split("id=")
  //   console.log(search[1])
  // }, [location])

  // useEffect(() => {
  //   console.log(addPositionFilter)
  // }, [addPositionFilter])

  const getPosition = useCallback(async () => {
    if (id === `0`) {
      setIsError({
        type: `notFound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client(token).query({
        query: gql`
          query Position {
            position(id: "${id}") {
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
              published_at
              createdAt
              updatedAt
              division {
                _id
              }
            }
          }
        `,
      })

      const thisPosition = res.data.position

      if (thisPosition !== null) {
        setCurrentPosNumber(thisPosition.number)
        setAddPositionFilter({
          posId: thisPosition.position_type._id,
          posName: thisPosition.position_type.name,
          posType: thisPosition.position_type.type,
          posNumber: thisPosition.number,
          unit: units.find(elem => elem._id === thisPosition.division._id),
          posOpen: thisPosition.isOpen,
          posSouth: thisPosition.isSouth,
          haveABudget: thisPosition.have_a_budget,
        })
        setCount(prev => prev + 1)
      } else {
        setIsError({
          type: `notFound`,
          text: `ไม่พบข้อมูลหน้านี้`,
        })
      }
    } catch (error) {
      console.log(error)

      setIsError({
        type: `notFound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }, [token, dispatch, id, units])

  const goEdit = async () => {
    let posNumberIsExisted = false

    setIsError({
      type: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    if (currentPosNumber !== addPositionFilter.posNumber) {
      try {
        const res = await client(token).query({
          query: gql`
            query Positions {
              positions(where: {
                number: "${addPositionFilter.posNumber}"
              }) {
                _id
                position_type {
                  type
                  name
                }
                number
                isOpen
                isSouth
                staff_created
                staff_updated
                published_at
                createdAt
                updatedAt
              }
            }
          `,
        })

        if (res.data.positions.length > 0) {
          posNumberIsExisted = true

          setIsError({
            type: `posNumberIsExisted`,
            text: `มีเลขที่ตำแหน่งนี้ในฐานข้อมูลแล้ว`,
          })
        }
      } catch {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถตรวจสอบเลขที่ตำแหน่งได้`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => {},
          },
        })

        dispatch({
          type: `SET_BACKDROP_OPEN`,
          backdropOpen: false,
        })

        return 0
      }
    }

    if (!posNumberIsExisted) {
      try {
        await client(token).mutate({
          mutation: gql`
            mutation UpdatePosition {
              updatePosition(input: {
                where: {
                  id: "${id}"
                }
                data: {
                  position_type: "${addPositionFilter.posId}",
                  number: "${addPositionFilter.posNumber}",
                  isOpen: ${addPositionFilter.posOpen},
                  isSouth: ${addPositionFilter.posSouth},
                  have_a_budget: ${addPositionFilter.haveABudget},
                  staff_updated: "${userInfo._id}",
                  ${
                    roles[userInfo.role.name].level > 1
                      ? `division: "${addPositionFilter.unit._id}"`
                      : ``
                  }
                }
              }) {
                position {
                  _id
                  position_type {
                    type
                    name
                  }
                  number
                  isOpen
                  isSouth
                  published_at
                  createdAt
                  updatedAt
                }
              }
            }
          `,
        })
        // console.log(res)

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การบันทึกข้อมูล`,
            description: `แก้ไขข้อมูลคลังตำแหน่งสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/positions/list/`)
            },
          },
        })

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "positions -> save -> ${id}",
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
        console.log(error)

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การบันทึกข้อมูลไม่สำเร็จ`,
            description: `ไม่สามารถแก้ไขรายการคลังตำแหน่งได้`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => {},
          },
        })
      }
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  useEffect(() => {
    if (token !== `` && userInfo._id !== ``) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "positions -> edit -> ${id}",
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

  useEffect(() => {
    if (token !== ``) {
      getPosition()
    }
  }, [getPosition, token])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level <= 3 ? (
        isError.type !== `notFound` ? (
          <>
            <Seo title="แก้ไขคลังตำแหน่ง" />
            <Breadcrumbs
              previous={[
                {
                  name:
                    roles[userInfo.role.name].level <= 1
                      ? `จัดการคลังตำแหน่ง (${
                          userInfo.division !== null
                            ? renderDivision(userInfo.division)
                            : `-`
                        })`
                      : `จัดการคลังตำแหน่ง`,
                  link: `/positions/`,
                },
                {
                  name: `ค้นหาคลังตำแหน่ง`,
                  link: `/positions/list/`,
                },
              ]}
              current="แก้ไขคลังตำแหน่ง"
            />

            {count > 0 && (
              <>
                <Form
                  onSubmit={e => {
                    e.preventDefault()
                    goEdit()
                  }}
                  style={{ maxWidth: 400 }}
                >
                  <Flex style={{ marginBottom: `1rem` }}>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="position-type"
                      disablePortal
                      options={positionTypes}
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => option.type}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        if (newValue !== null) {
                          setAddPositionFilter({
                            ...addPositionFilter,
                            posType: newValue.type,
                            posName: ``,
                          })
                        } else {
                          setAddPositionFilter({
                            ...addPositionFilter,
                            posId: ``,
                            posType: ``,
                            posName: ``,
                          })
                        }
                      }}
                      value={
                        addPositionFilter.posType !== ``
                          ? positionTypes.find(
                              elem => elem.type === addPositionFilter.posType
                            )
                          : null
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="ชื่อประเภทกลุ่มงาน"
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
                      {renderCheckingIcon(
                        addPositionFilter.posType !== `` ? `correct` : ``
                      )}
                    </CheckCircleFlex>
                  </Flex>

                  <Flex style={{ marginBottom: `1rem` }}>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="position-name"
                      disablePortal
                      options={
                        addPositionFilter.posType !== ``
                          ? positionNames.filter(
                              elem => elem.type === addPositionFilter.posType
                            )
                          : positionNames
                      }
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        if (newValue !== null) {
                          setAddPositionFilter({
                            ...addPositionFilter,
                            posId: newValue._id,
                            posName: newValue.name,
                            posType: newValue.type,
                          })
                        } else {
                          setAddPositionFilter({
                            ...addPositionFilter,
                            posId: ``,
                            posName: ``,
                          })
                        }
                      }}
                      value={
                        addPositionFilter.posName !== ``
                          ? positionNames.find(
                              elem => elem.name === addPositionFilter.posName
                            )
                          : null
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="ชื่อตำแหน่งในสายงาน"
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
                      {renderCheckingIcon(
                        addPositionFilter.posName !== `` ? `correct` : ``
                      )}
                    </CheckCircleFlex>
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
                            setAddPositionFilter({
                              ...addPositionFilter,
                              unit: newValue,
                            })
                          } else {
                            setAddPositionFilter({
                              ...addPositionFilter,
                              unit: null,
                            })
                          }
                        }}
                        value={addPositionFilter.unit}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="สังกัด"
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
                        {renderCheckingIcon(
                          addPositionFilter.unit !== null ? `correct` : ``
                        )}
                      </CheckCircleFlex>
                    </Flex>
                  )}

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
                        const newPosNumber = result
                          .toString()
                          .replaceAll(`,`, ``)

                        setAddPositionFilter({
                          ...addPositionFilter,
                          posNumber: newPosNumber,
                        })
                      } else {
                        setAddPositionFilter({
                          ...addPositionFilter,
                          posNumber: ``,
                        })
                      }
                    }}
                    value={addPositionFilter.posNumber}
                    error={isError.type === `posNumberIsExisted`}
                  />
                  {isError.type === `posNumberIsExisted` && (
                    <Alert sx={{ marginBottom: `1rem` }} severity="error">
                      {isError.text}
                    </Alert>
                  )}
                  <Flex>
                    <Checkbox
                      onChange={(_, newValue) => {
                        setAddPositionFilter({
                          ...addPositionFilter,
                          haveABudget: newValue,
                        })
                      }}
                      checked={addPositionFilter.haveABudget}
                    />
                    <div
                      role="presentation"
                      style={{ cursor: `pointer`, userSelect: `none` }}
                      onClick={() => {
                        setAddPositionFilter({
                          ...addPositionFilter,
                          haveABudget: !addPositionFilter.haveABudget,
                        })
                      }}
                    >
                      มีงบประมาณ
                    </div>
                  </Flex>
                  <Flex>
                    <Checkbox
                      onChange={(_, newValue) => {
                        setAddPositionFilter({
                          ...addPositionFilter,
                          posOpen: newValue,
                        })
                      }}
                      checked={addPositionFilter.posOpen}
                    />
                    <div
                      role="presentation"
                      style={{ cursor: `pointer`, userSelect: `none` }}
                      onClick={() =>
                        setAddPositionFilter({
                          ...addPositionFilter,
                          posOpen: !addPositionFilter.posOpen,
                        })
                      }
                    >
                      เปิดอัตรา
                    </div>
                  </Flex>
                  <Flex style={{ marginBottom: `1rem` }}>
                    <Checkbox
                      onChange={(_, newValue) => {
                        setAddPositionFilter({
                          ...addPositionFilter,
                          posSouth: newValue,
                        })
                      }}
                      checked={addPositionFilter.posSouth}
                    />
                    <div
                      role="presentation"
                      style={{ cursor: `pointer`, userSelect: `none` }}
                      onClick={() =>
                        setAddPositionFilter({
                          ...addPositionFilter,
                          posSouth: !addPositionFilter.posSouth,
                        })
                      }
                    >
                      อัตรากำลังจังหวัดชายแดนภาคใต้
                    </div>
                  </Flex>

                  <Button
                    color="success"
                    variant="contained"
                    type="submit"
                    disabled={
                      roles[userInfo.role.name].level > 1
                        ? addPositionFilter.posName === `` ||
                          addPositionFilter.posType === `` ||
                          addPositionFilter.posNumber === `` ||
                          addPositionFilter.unit === null
                        : addPositionFilter.posName === `` ||
                          addPositionFilter.posType === `` ||
                          addPositionFilter.posNumber === ``
                    }
                  >
                    <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
                    บันทึก
                  </Button>
                </Form>

                <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
                <Flex
                  style={{
                    justifyContent: `end`,
                  }}
                >
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => {}}
                    disabled
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ marginRight: 5 }}
                    />
                    ลบ
                  </Button>
                </Flex>
              </>
            )}
          </>
        ) : (
          <PageNotFound
            desc="ไม่พบ url ที่ท่านเรียกหรือเนื้อหาในส่วนนี้ได้ถูกลบออกจากระบบ"
            link="/positions/list/"
            buttonText="กลับไปหน้าค้นหาคลังตำแหน่ง"
          />
        )
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default EditPositionsPage
