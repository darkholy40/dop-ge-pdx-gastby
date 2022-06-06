import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, Alert, TextField, Divider, Checkbox } from "@mui/material"
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
import { Form, SubmitButtonFlex, Flex } from "../../components/styles"
import renderDivision from "../../functions/render-division"

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
  const { token, userInfo, searchPersonFilter, units } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: `disabled`,
    text: `กำลังตรวจสอบคลังตำแหน่ง...`,
  })

  const getPositions = useCallback(async () => {
    let role = ``

    if (userInfo.role.name !== `Administrator`) {
      role = `division: "${userInfo.division._id}"`
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
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
            userInfo.role.name === `Administrator` ? `ทั้ง ทบ.` : ``
          } ${totalCount} ตำแหน่ง`,
        })
      } else {
        setIsError({
          status: `notfound`,
          text: `ไม่มีตำแหน่งว่าง`,
        })
      }
    } catch {
      getPositions()

      return 0
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }, [token, userInfo, dispatch])

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
          <Seo
            title={
              userInfo.role.name !== `Administrator`
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
              userInfo.role.name !== `Administrator`
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

            {userInfo.role.name !== `Administrator` ? (
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
                <FontAwesomeIcon
                  icon={faPlusCircle}
                  style={{ marginRight: 5 }}
                />
                เพิ่มกำลังพล
              </Button>
            ) : (
              <></>
            )}
          </Oparator>
          <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
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
            <Flex style={{ marginBottom: `1rem` }}>
              <Checkbox
                onChange={(_, newValue) => {
                  dispatch({
                    type: `SET_SEARCH_PERSON_FILTER`,
                    searchPersonFilter: {
                      ...searchPersonFilter,
                      isResigned: newValue,
                    },
                  })
                }}
                checked={searchPersonFilter.isResigned}
              />
              <div
                role="presentation"
                style={{ cursor: `pointer`, userSelect: `none` }}
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
                ที่ลาออกแล้ว
              </div>
            </Flex>
            <SubmitButtonFlex>
              <Button
                style={{
                  width: `100%`,
                  marginRight: 10,
                }}
                color="primary"
                variant="contained"
                onClick={() =>
                  navigate(
                    !searchPersonFilter.isResigned
                      ? `/people/list/`
                      : `/people/resigned-list/`
                  )
                }
              >
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: 5 }} />
                ค้นหา
              </Button>
              <Button
                style={{
                  width: `100%`,
                }}
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
                  searchPersonFilter.posNumber === `` &&
                  searchPersonFilter.unit === null &&
                  searchPersonFilter.isResigned === false
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
