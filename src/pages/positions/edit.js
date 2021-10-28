import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Button,
  TextField,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import positionType from "../../positionType"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
`

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
`

const EditPositionsPage = ({ location }) => {
  const { token, userInfo, url, addPositionFilter } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [count, setCount] = useState(0)
  const [currentPosNumber, setCurrentPosNumber] = useState(``)
  const [isError, setIsError] = useState({
    type: ``,
    text: ``,
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
              Pos_Name
              Pos_Type
              Pos_Number
              Pos_Open
              Pos_South
              published_at
              createdAt
              updatedAt
            }
          }
        `,
      })

      const thisPosition = res.data.position

      if (thisPosition !== null) {
        setCurrentPosNumber(thisPosition.Pos_Number)
        dispatch({
          type: `SET_ADD_POSITION_FILTER`,
          addPositionFilter: {
            posName: thisPosition.Pos_Name,
            posType: thisPosition.Pos_Type,
            posNumber: thisPosition.Pos_Number,
            posOpen: thisPosition.Pos_Open,
            posSouth: thisPosition.Pos_South,
          },
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
  }, [url, dispatch, id])

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
                Pos_Number: "${addPositionFilter.posNumber}"
              }) {
                _id
                Pos_Name
                Pos_Type
                Pos_Number
                Pos_Open
                Pos_South
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
                  Pos_Name: "${addPositionFilter.posName}",
                  Pos_Type: "${addPositionFilter.posType}",
                  Pos_Number: "${addPositionFilter.posNumber}",
                  Pos_Open: ${addPositionFilter.posOpen},
                  Pos_South: ${addPositionFilter.posSouth},
                  staff_updated: "${userInfo._id}",
                }
              }) {
                position {
                  _id
                  Pos_Name
                  Pos_Type
                  Pos_Number
                  Pos_Open
                  Pos_South
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
    dispatch({
      type: `SET_ADD_POSITION_FILTER`,
      addPositionFilter: {
        posName: ``,
        posType: ``,
        posNumber: ``,
        posOpen: false,
        posSouth: false,
      },
    })
  }, [dispatch])

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
                  <TextField
                    sx={{ marginBottom: `1rem` }}
                    id="pos-name"
                    label="ชื่อตำแหน่ง"
                    variant="outlined"
                    onChange={e => {
                      dispatch({
                        type: `SET_ADD_POSITION_FILTER`,
                        addPositionFilter: {
                          ...addPositionFilter,
                          posName: e.target.value,
                        },
                      })
                    }}
                    value={addPositionFilter.posName}
                  />
                  <FormControl fullWidth>
                    <InputLabel id="pos-type-label-id">
                      ชื่อประเภทกลุ่มงาน
                    </InputLabel>
                    <Select
                      sx={{ marginBottom: `1rem` }}
                      labelId="pos-type-label-id"
                      id="pos-type"
                      label="ชื่อประเภทกลุ่มงาน"
                      onChange={e => {
                        dispatch({
                          type: `SET_ADD_POSITION_FILTER`,
                          addPositionFilter: {
                            ...addPositionFilter,
                            posType: e.target.value,
                          },
                        })
                      }}
                      value={addPositionFilter.posType}
                    >
                      <MenuItem value="" selected>
                        ---
                      </MenuItem>
                      {positionType.map((item, index) => {
                        return (
                          <MenuItem key={`postype_${index}`} value={item}>
                            {item}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                  {/* <TextField
                  sx={{ marginBottom: `1rem` }}
                  id="pos-type"
                  label="ชื่อประเภทกลุ่มงาน"
                  variant="outlined"
                  onChange={e => {
                    dispatch({
                      type: `SET_ADD_POSITION_FILTER`,
                      addPositionFilter: {
                        ...addPositionFilter,
                        posType: e.target.value,
                      },
                    })
                  }}
                  value={addPositionFilter.posType}
                /> */}
                  <TextField
                    sx={{ marginBottom: `1rem` }}
                    id="pos-number"
                    label="เลขที่ตำแหน่ง"
                    variant="outlined"
                    onChange={e => {
                      dispatch({
                        type: `SET_ADD_POSITION_FILTER`,
                        addPositionFilter: {
                          ...addPositionFilter,
                          posNumber: e.target.value,
                        },
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
                        dispatch({
                          type: `SET_ADD_POSITION_FILTER`,
                          addPositionFilter: {
                            ...addPositionFilter,
                            posOpen: newValue,
                          },
                        })
                      }}
                      checked={addPositionFilter.posOpen}
                    />
                    <div>เปิดอัตรา</div>
                  </Flex>
                  <Flex>
                    <Checkbox
                      onChange={(_, newValue) => {
                        dispatch({
                          type: `SET_ADD_POSITION_FILTER`,
                          addPositionFilter: {
                            ...addPositionFilter,
                            posSouth: newValue,
                          },
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
