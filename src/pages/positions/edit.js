import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Button, TextField, Checkbox, Divider, Alert } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import { Form, Flex, CheckCircleFlex } from "../../components/Styles"
import renderCheckingIcon from "../../functions/renderCheckingIcon"

const EditPositionsPage = ({ location }) => {
  const { token, userInfo, url, positionTypes, positionNames, units } =
    useSelector(state => state)
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
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })

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
      const res = await client.query({
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
  }, [url, dispatch, id, units])

  const goEdit = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
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
        const res = await client.query({
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
            title: `เพิ่มรายการไม่สำเร็จ`,
            description: `ไม่สามารถเพิ่มรายการคลังตำแหน่งได้`,
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
        await client.mutate({
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
                  staff_updated: "${userInfo._id}",
                  ${
                    userInfo.role.name === `Administrator`
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

        navigate(`/positions/list`)
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `แก้ไขรายการสำเร็จ`,
            description: `บันทึกรายการคลังตำแหน่งสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {},
          },
        })
      } catch (error) {
        console.log(error)

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `แก้ไขรายการไม่สำเร็จ`,
            description: `ไม่สามารถบันทึกรายการคลังตำแหน่งได้`,
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

  const resetInput = useCallback(() => {
    setAddPositionFilter({
      posId: ``,
      posName: ``,
      posType: ``,
      posNumber: ``,
      unit: null,
      posOpen: false,
      posSouth: false,
    })
  }, [])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })

    resetInput()

    getPosition()
  }, [dispatch, getPosition, resetInput])

  return (
    <Layout>
      {token !== "" ? (
        isError.type !== `notFound` ? (
          <>
            <Seo title="แก้ไขคลังตำแหน่ง" />
            <Breadcrumbs
              previous={[
                {
                  name: `คลังตำแหน่ง`,
                  link: `/positions`,
                },
                {
                  name: `ค้นหา`,
                  link: `/positions/list`,
                },
              ]}
              current="แก้ไข"
            />

            {count > 0 && (
              <>
                <Form>
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

                  {userInfo.role.name === `Administrator` && (
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
                      setAddPositionFilter({
                        ...addPositionFilter,
                        posNumber: e.target.value,
                      })
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
                          posOpen: newValue,
                        })
                      }}
                      checked={addPositionFilter.posOpen}
                    />
                    <div>เปิดอัตรา</div>
                  </Flex>
                  <Flex>
                    <Checkbox
                      onChange={(_, newValue) => {
                        setAddPositionFilter({
                          ...addPositionFilter,
                          posSouth: newValue,
                        })
                      }}
                      checked={addPositionFilter.posSouth}
                    />
                    <div>อัตรากำลังจังหวัดชายแดนภาคใต้</div>
                  </Flex>

                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => goEdit()}
                    disabled={
                      addPositionFilter.posName === `` ||
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
                  <Button color="error" variant="outlined" onClick={() => {}}>
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
            desc="ไม่พบ url ที่เรียกหรือเนื้อหาในส่วนนี้ได้ถูกลบออกจากระบบ"
            link="/positions/list"
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
