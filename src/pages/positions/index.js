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
import { Form, SubmitButtonFlex, Flex } from "../../components/styles"
import renderDivision from "../../functions/render-division"
import roles from "../../static/roles"

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
  const { token, userInfo, searchPositionFilter } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { positionTypes, positionNames, units } = useSelector(
    ({ staticReducer }) => staticReducer
  )
  const dispatch = useDispatch()

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (
      token !== `` &&
      userInfo._id !== `` &&
      roles[userInfo.role.name].level < 3
    ) {
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
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo
            title={
              roles[userInfo.role.name].level <= 1
                ? `จัดการคลังตำแหน่ง (${
                    userInfo.division !== null
                      ? renderDivision(userInfo.division)
                      : `-`
                  })`
                : `จัดการคลังตำแหน่ง`
            }
          />
          <Breadcrumbs
            current={
              roles[userInfo.role.name].level <= 1
                ? `จัดการคลังตำแหน่ง (${
                    userInfo.division !== null
                      ? renderDivision(userInfo.division)
                      : `-`
                  })`
                : `จัดการคลังตำแหน่ง`
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
                <SubmitButtonFlex>
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
                          unit: null,
                        },
                      })
                    }}
                    disabled={
                      searchPositionFilter.posName === `` &&
                      searchPositionFilter.posType === `` &&
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
                </SubmitButtonFlex>
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
