import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Button,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
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

const AddPositionsPage = () => {
  const { token, userInfo, url, addPositionFilter } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: false,
    type: ``,
    text: ``,
  })

  const goAdd = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let posNumberIsExisted = false

    setIsError({
      status: false,
      type: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

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
          status: true,
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
          callback: () => {},
        },
      })

      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropOpen: false,
      })

      return 0
    }

    if (!posNumberIsExisted) {
      try {
        await client.mutate({
          mutation: gql`
            mutation CreatePosition {
              createPosition(input: {
                data: {
                  Pos_Name: "${addPositionFilter.posName}",
                  Pos_Type: "${addPositionFilter.posType}",
                  Pos_Number: "${addPositionFilter.posNumber}",
                  Pos_Open: ${addPositionFilter.posOpen},
                  Pos_South: ${addPositionFilter.posSouth},
                  staff_created: "${userInfo._id}",
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

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เพิ่มรายการสำเร็จ`,
            description: `เพิ่มรายการคลังตำแหน่งสำเร็จ`,
            variant: `success`,
            callback: () => {
              resetInput()
            },
          },
        })
      } catch (error) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เพิ่มรายการไม่สำเร็จ`,
            description: `ไม่สามารถเพิ่มรายการคลังตำแหน่งได้`,
            variant: `error`,
            callback: () => {},
          },
        })

        console.log(error)
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
  }, [dispatch])

  return (
    <Layout>
      {token !== "" ? (
        <>
          <Seo title="เพิ่มคลังตำแหน่ง" />
          <Breadcrumbs
            previous={[
              {
                name: `คลังตำแหน่ง`,
                link: `/positions`,
              },
            ]}
            current="เพิ่ม"
          />

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
              <InputLabel id="pos-type-label-id">ชื่อประเภทกลุ่มงาน</InputLabel>
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
              error={isError.status && isError.type === `posNumberIsExisted`}
            />
            {isError.status && isError.type === `posNumberIsExisted` && (
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
              onClick={() => goAdd()}
              disabled={
                addPositionFilter.posName === `` ||
                addPositionFilter.posType === `` ||
                addPositionFilter.posNumber === ``
              }
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
              เพิ่มรายการ
            </Button>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default AddPositionsPage
