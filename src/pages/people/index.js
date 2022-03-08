import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, Alert, TextField } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import { Form, SubmitButtonFlex, Flex } from "../../components/Styles"

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
  const { token, url, userInfo, searchPersonFilter, units } = useSelector(
    state => state
  )
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
    let role = ``

    if (userInfo.role.name !== `Administrator`) {
      role = `division: "${userInfo.division._id}"`
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client.query({
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
          text: `มีตำแหน่งว่าง ${totalCount} ตำแหน่ง`,
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

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }, [url, userInfo, dispatch])

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
      {token !== `` ? (
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
                isError.status === `disabled` || isError.status === `notfound`
              }
              onClick={() => {
                navigate(`/people/add`)
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
              เพิ่มกำลังพล
            </Button>
          </Oparator>

          <Form onSubmit={e => e.preventDefault()}>
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
                dispatch({
                  type: `SET_SEARCH_PERSON_FILTER`,
                  searchPersonFilter: {
                    ...searchPersonFilter,
                    personId: e.target.value,
                  },
                })
              }}
              value={searchPersonFilter.personId}
            />
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="person-sid"
              label="หมายเลขประจำตัวข้าราชการกองทัพบก (10 หลัก)"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_PERSON_FILTER`,
                  searchPersonFilter: {
                    ...searchPersonFilter,
                    personSid: e.target.value,
                  },
                })
              }}
              value={searchPersonFilter.personSid}
            />
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="pos-number"
              label="เลขที่ตำแหน่ง"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_PERSON_FILTER`,
                  searchPersonFilter: {
                    ...searchPersonFilter,
                    posNumber: e.target.value,
                  },
                })
              }}
              value={searchPersonFilter.posNumber}
            />
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
            <SubmitButtonFlex>
              <Button
                style={{
                  width: `100%`,
                  marginRight: 10,
                }}
                color="primary"
                variant="contained"
                onClick={() => navigate(`/people/list`)}
              >
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: 5 }} />
                ค้นหา
              </Button>
              <Button
                style={{
                  width: `100%`,
                }}
                color="error"
                type="reset"
                onClick={() => {
                  dispatch({
                    type: `SET_SEARCH_PERSON_FILTER`,
                    searchPersonFilter: {
                      personName: ``,
                      personSurname: ``,
                      personId: ``,
                      personSid: ``,
                      posNumber: ``,
                      unit: null,
                    },
                  })
                }}
                disabled={
                  searchPersonFilter.personName === `` &&
                  searchPersonFilter.personSurname === `` &&
                  searchPersonFilter.personId === `` &&
                  searchPersonFilter.personSid === `` &&
                  searchPersonFilter.posNumber === `` &&
                  searchPersonFilter.unit === null
                }
              >
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 5 }} />
                ล้าง
              </Button>
            </SubmitButtonFlex>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage