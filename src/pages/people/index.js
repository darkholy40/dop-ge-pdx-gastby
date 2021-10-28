import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, Alert } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"

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
  const { token, url, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: `disabled`,
    text: `กำลังตรวจสอบคลังตำแหน่ง...`,
  })

  const getPositions = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })

    try {
      const res = await client.query({
        query: gql`
          query Positions {
            positions(where: {
              Pos_Open: true
              staff_created: "${userInfo.id}"
              person_id: ""
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
        setIsError({
          status: ``,
          text: `มีตำแหน่งว่าง ${res.data.positions.length} ตำแหน่ง`,
        })
      } else {
        setIsError({
          status: `notfound`,
          text: `ไม่มีตำแหน่งว่าง`,
        })
      }
    } catch {
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `เชื่อมต่อฐานข้อมูลไม่สำเร็จ`,
          description: `ไม่สามารถรับข้อมูลคลังตำแหน่งได้`,
          variant: `error`,
          confirmText: `เชื่อมต่ออีกครั้ง`,
          callback: () => {
            getPositions()
          },
        },
      })
    }
  }, [url, userInfo.id, dispatch])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

  useEffect(() => {
    getPositions()
  }, [getPositions])

  useEffect(() => {
    console.log(isError.status)
  }, [isError])

  return (
    <Layout>
      {token !== "" ? (
        <>
          <Seo title="จัดการประวัติกำลังพล" />
          <Breadcrumbs current="จัดการประวัติกำลังพล" />

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
              }}
              color="primary"
              // variant="contained"
              disabled={
                isError.status === `disable` || isError.status === `notfound`
              }
              onClick={() => {
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

                navigate(`/people/add`)
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
              เพิ่มกำลังพล
            </Button>
          </Oparator>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
