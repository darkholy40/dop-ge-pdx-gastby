import React, { useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, TextField, Checkbox } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"

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
  const { token, url, addPositionFilter } = useSelector(state => state)
  const dispatch = useDispatch()

  const goAdd = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client.mutate({
        mutation: gql`
          mutation CreatePosition {
            createPosition(input: {
              data: {
                Pos_Name: "${addPositionFilter.posName}",
                Pos_type: "${addPositionFilter.posType}",
                Pos_Number: "${addPositionFilter.posNumber}",
                Pos_Open: ${addPositionFilter.posOpen},
                Pos_South: ${addPositionFilter.posSouth},
              }
            }) {
              position {
                _id
                Pos_Name
                Pos_type
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

      console.log(res)

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
      console.log(error)
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
  }, [dispatch, resetInput])

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
            current="เพิ่มคลังตำแหน่ง"
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
            <TextField
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
            />
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
            />
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
