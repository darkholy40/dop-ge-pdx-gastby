import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Grid, Button, TextField, Divider } from "@mui/material"
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
import { Form, SearchButtonContainer, Flex } from "../../components/styles"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const Oparator = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
`

const PositionsPage = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { positionTypes, positionNames, units } = useSelector(
    ({ staticReducer }) => staticReducer
  )
  const { searchPositionFilter } = useSelector(
    ({ positionsReducer }) => positionsReducer
  )
  const dispatch = useDispatch()

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "positions",
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
  }, [token, userInfo])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 1 ? (
        <>
          <Seo
            title={
              roleLevel(userInfo.role) <= 1
                ? `คลังตำแหน่ง (${renderDivision(userInfo.division)})`
                : `คลังตำแหน่ง`
            }
          />
          <Breadcrumbs
            current={
              roleLevel(userInfo.role) <= 1
                ? `คลังตำแหน่ง (${renderDivision(userInfo.division)})`
                : `คลังตำแหน่ง`
            }
          />

          <Oparator>
            <Button
              color="success"
              variant="outlined"
              onClick={() => {
                navigate(`/positions/add/`)
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
              เพิ่มคลังตำแหน่ง
            </Button>
          </Oparator>
          <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
          <Form onSubmit={e => e.preventDefault()}>
            <Grid
              container
              spacing={2}
              sx={{
                alignItems: `center`,
                justifyContent: `center`,
              }}
            >
              <Grid
                item
                xs={12}
                sm={6}
                style={{
                  display: `flex`,
                  flexDirection: `column`,
                }}
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
                        dispatch({
                          type: `SET_SEARCH_POSITION_FILTER`,
                          searchPositionFilter: {
                            ...searchPositionFilter,
                            posType: newValue.type,
                            posName: ``,
                          },
                        })
                      } else {
                        dispatch({
                          type: `SET_SEARCH_POSITION_FILTER`,
                          searchPositionFilter: {
                            ...searchPositionFilter,
                            posType: ``,
                            posName: ``,
                          },
                        })
                      }
                    }}
                    value={
                      searchPositionFilter.posType !== ``
                        ? positionTypes.find(
                            elem => elem.type === searchPositionFilter.posType
                          )
                        : null
                    }
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ชื่อประเภทกลุ่มงาน"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                </Flex>

                <Flex style={{ marginBottom: `1rem` }}>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="position-name"
                    disablePortal
                    options={
                      searchPositionFilter.posType !== ``
                        ? positionNames.filter(
                            elem => elem.type === searchPositionFilter.posType
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
                        dispatch({
                          type: `SET_SEARCH_POSITION_FILTER`,
                          searchPositionFilter: {
                            ...searchPositionFilter,
                            posName: newValue.name,
                            posType: newValue.type,
                          },
                        })
                      } else {
                        dispatch({
                          type: `SET_SEARCH_POSITION_FILTER`,
                          searchPositionFilter: {
                            ...searchPositionFilter,
                            posName: ``,
                          },
                        })
                      }
                    }}
                    value={
                      searchPositionFilter.posName !== ``
                        ? positionNames.find(
                            elem => elem.name === searchPositionFilter.posName
                          )
                        : null
                    }
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ชื่อตำแหน่งในสายงาน"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                </Flex>

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
                        type: `SET_SEARCH_POSITION_FILTER`,
                        searchPositionFilter: {
                          ...searchPositionFilter,
                          posNumber: newPosNumber,
                        },
                      })
                    } else {
                      dispatch({
                        type: `SET_SEARCH_POSITION_FILTER`,
                        searchPositionFilter: {
                          ...searchPositionFilter,
                          posNumber: ``,
                        },
                      })
                    }
                  }}
                  value={searchPositionFilter.posNumber}
                />

                {roleLevel(userInfo.role) > 1 && (
                  <Flex style={{ marginBottom: `1rem` }}>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="unit"
                      disablePortal
                      options={units}
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => renderDivision(option)}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        if (newValue !== null) {
                          dispatch({
                            type: `SET_SEARCH_POSITION_FILTER`,
                            searchPositionFilter: {
                              ...searchPositionFilter,
                              unit: newValue,
                            },
                          })
                        } else {
                          dispatch({
                            type: `SET_SEARCH_POSITION_FILTER`,
                            searchPositionFilter: {
                              ...searchPositionFilter,
                              unit: null,
                            },
                          })
                        }
                      }}
                      value={searchPositionFilter.unit}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <SearchButtonContainer>
                  <Button
                    style={{ marginRight: 10 }}
                    color="error"
                    variant="outlined"
                    type="reset"
                    onClick={() => {
                      dispatch({
                        type: `SET_SEARCH_POSITION_FILTER`,
                        searchPositionFilter: {
                          ...searchPositionFilter,
                          posName: ``,
                          posType: ``,
                          posNumber: ``,
                          unit: null,
                        },
                      })
                    }}
                    disabled={
                      searchPositionFilter.posName === `` &&
                      searchPositionFilter.posType === `` &&
                      searchPositionFilter.posNumber === `` &&
                      searchPositionFilter.unit === null
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ marginRight: 5 }}
                    />
                    ล้าง
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                      dispatch({
                        type: `SET_SEARCH_POSITION_FILTER`,
                        searchPositionFilter: {
                          ...searchPositionFilter,
                          currentPage: 0,
                        },
                      })
                      navigate(`/positions/list/`)
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ marginRight: 5 }}
                    />
                    ค้นหา
                  </Button>
                </SearchButtonContainer>
              </Grid>
            </Grid>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
