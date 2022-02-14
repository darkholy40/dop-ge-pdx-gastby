import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, TextField } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import renderCheckingIcon from "../../functions/renderCheckingIcon"

const Oparator = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
`

const SubmitButtonFlex = styled.div`
  display: flex;
  justify-content: space-between;
`

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

const CheckCircleFlex = styled.div`
  border-radius: 0 5px 5px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.24);
  border-right: 1px solid rgba(0, 0, 0, 0.24);
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);
  height: 54px;
  width: 30px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PositionsPage = () => {
  const {
    token,
    userInfo,
    searchPositionFilter,
    positionTypes,
    positionNames,
    units,
  } = useSelector(state => state)
  const dispatch = useDispatch()

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
          <Seo title="คลังตำแหน่ง" />
          <Breadcrumbs current="คลังตำแหน่ง" />

          <Oparator>
            <Button
              color="primary"
              // variant="contained"
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

                navigate(`/positions/add`)
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
              เพิ่มคลังตำแหน่ง
            </Button>
          </Oparator>
          <Form onSubmit={e => e.preventDefault()}>
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
                      sx: {
                        borderRadius: `5px 0 0 5px`,
                      },
                    }}
                  />
                )}
              />
              <CheckCircleFlex>
                {renderCheckingIcon(
                  searchPositionFilter.posType !== `` ? `correct` : ``
                )}
              </CheckCircleFlex>
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
                      sx: {
                        borderRadius: `5px 0 0 5px`,
                      },
                    }}
                  />
                )}
              />
              <CheckCircleFlex>
                {renderCheckingIcon(
                  searchPositionFilter.posName !== `` ? `correct` : ``
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
                        sx: {
                          borderRadius: `5px 0 0 5px`,
                        },
                      }}
                    />
                  )}
                />
                <CheckCircleFlex>
                  {renderCheckingIcon(
                    searchPositionFilter.unit !== null ? `correct` : ``
                  )}
                </CheckCircleFlex>
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
                onClick={() => navigate(`/positions/list`)}
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
                    type: `SET_SEARCH_POSITION_FILTER`,
                    searchPositionFilter: {
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
