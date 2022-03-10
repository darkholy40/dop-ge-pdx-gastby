import React, { useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Button, TextField, Alert } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import { Form } from "../../components/Styles"

const Resignation = ({ location }) => {
  const { token, userInfo, url } = useSelector(state => state)
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: false,
    type: ``,
    text: ``,
  })
  const [input, setInput] = useState({
    note: ``,
  })
  const search = location.search.split("id=")
  const id = search[1] || `0`

  const goSaveResignation = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let getPersonID = ``
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
      const resPosition = await client.query({
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
        const res = await client.mutate({
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
                  staff_updated: "${userInfo.id}"
                }
              }) {
                person {
                  _id
                }
              }
            }
          `,
        })

        console.log(res.data)

        if (res) {
          getPersonID = res.data.updatePerson.person._id
        }
      }
    } catch {
      setIsError({
        status: true,
        type: `id-notfound`,
        text: `ไม่พบกำลังพลรายการนี้ หรือข้อมูลถูกลบออกจากระบบแล้ว`,
      })

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `บันทึกรายการไม่สำเร็จ`,
          description: `ไม่พบกำลังพลรายการนี้ หรือข้อมูลถูกลบออกจากระบบแล้ว`,
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
        const res = await client.query({
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
            title: `บันทึกรายการไม่สำเร็จ`,
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
          await client.mutate({
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
          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `บันทึกรายการไม่สำเร็จ`,
              description: `[Error003] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
              variant: `error`,
              confirmText: `ลองอีกครั้ง`,
              callback: () => goSaveResignation(),
            },
          })

          console.log(error)
        }
      }

      if (check.pass1) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `บันทึกรายการสำเร็จ`,
            description: `แก้ไขรายการกำลังพลสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/people/list`)
            },
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
      currentPage: `people`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="กำลังพลลาออก" />
          <Breadcrumbs
            previous={[
              {
                name: `จัดการประวัติกำลังพล`,
                link: `/people`,
              },
              {
                name: `ค้นหากำลังพล`,
                link: `/people/list`,
              },
            ]}
            current="กำลังพลลาออก"
          />

          <Form
            onSubmit={e => {
              e.preventDefault()
              goSaveResignation()
            }}
          >
            <TextField
              sx={{ marginBottom: `1rem` }}
              multiline
              id="resignation-note"
              label="สาเหตุการลาออก"
              variant="outlined"
              onChange={e => {
                setInput({
                  ...input,
                  note: e.target.value,
                })
              }}
              value={input.note}
              disabled={isError.type === `id-notfound`}
            />

            <Button
              color="primary"
              variant="contained"
              type="submit"
              disabled={input.note === `` || isError.type === `id-notfound`}
            >
              <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
              บันทึก
            </Button>
            {isError.type === `id-notfound` && (
              <>
                <Alert
                  sx={{ marginTop: `1rem`, animation: `fadein 0.3s` }}
                  severity="error"
                >
                  {isError.text}
                </Alert>

                <Button
                  sx={{ marginTop: `3rem` }}
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(`/people/list`)}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    style={{ marginRight: 5 }}
                  />
                  กลับไปหน้าค้นหากำลังพล
                </Button>
              </>
            )}
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default Resignation
