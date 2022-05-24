import React, { useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Button, TextField, Checkbox, Alert } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import { Form, Flex, CheckCircleFlex } from "../../components/Styles"
import renderCheckingIcon from "../../functions/renderCheckingIcon"
import renderDivision from "../../functions/renderDivision"

const AddPositionsPage = () => {
  const { token, userInfo, url, positionTypes, positionNames, units } =
    useSelector(state => state)
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: false,
    type: ``,
    text: ``,
  })
  const [addPositionFilter, setAddPositionFilter] = useState({
    posId: ``,
    posName: ``,
    posType: ``,
    posNumber: ``,
    unit: null,
    posOpen: false,
    posSouth: false,
    haveABudget: true,
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
              number: "${addPositionFilter.posNumber}"
            }) {
              _id
              position_type {
                type
                name
              }
              number
              isOpen
              isSouth
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

    if (!posNumberIsExisted) {
      try {
        await client.mutate({
          mutation: gql`
            mutation CreatePosition {
              createPosition(input: {
                data: {
                  position_type: "${addPositionFilter.posId}",
                  number: "${addPositionFilter.posNumber}",
                  isOpen: ${addPositionFilter.posOpen},
                  isSouth: ${addPositionFilter.posSouth},
                  have_a_budget: ${addPositionFilter.haveABudget},
                  staff_created: "${userInfo._id}",
                  staff_updated: "",
                  person: null,
                  division: "${
                    userInfo.role.name === `Administrator`
                      ? `${addPositionFilter.unit._id}`
                      : `${userInfo.division._id}`
                  }"
                }
              }) {
                position {
                  _id
                  position_type {
                    type
                    name
                  }
                  number
                  isOpen
                  isSouth
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
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/positions`)
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
            confirmText: `ตกลง`,
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

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="เพิ่มคลังตำแหน่ง" />
          <Breadcrumbs
            previous={[
              {
                name:
                  userInfo.role.name !== `Administrator`
                    ? `จัดการคลังตำแหน่ง (${
                        userInfo.division !== null
                          ? renderDivision(userInfo.division)
                          : `-`
                      })`
                    : `จัดการคลังตำแหน่ง`,
                link: `/positions`,
              },
            ]}
            current="เพิ่มคลังตำแหน่ง"
          />

          <Form
            onSubmit={e => {
              e.preventDefault()
              goAdd()
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
                    setAddPositionFilter({
                      ...addPositionFilter,
                      posType: newValue.type,
                      posName: ``,
                    })
                  } else {
                    setAddPositionFilter({
                      ...addPositionFilter,
                      posId: ``,
                      posType: ``,
                      posName: ``,
                    })
                  }
                }}
                value={
                  addPositionFilter.posType !== ``
                    ? positionTypes.find(
                        elem => elem.type === addPositionFilter.posType
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
                  addPositionFilter.posType !== `` ? `correct` : ``
                )}
              </CheckCircleFlex>
            </Flex>

            <Flex style={{ marginBottom: `1rem` }}>
              <Autocomplete
                sx={{ width: `100%` }}
                id="position-name"
                disablePortal
                options={
                  addPositionFilter.posType !== ``
                    ? positionNames.filter(
                        elem => elem.type === addPositionFilter.posType
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
                    setAddPositionFilter({
                      ...addPositionFilter,
                      posId: newValue._id,
                      posName: newValue.name,
                      posType: newValue.type,
                    })
                  } else {
                    setAddPositionFilter({
                      ...addPositionFilter,
                      posId: ``,
                      posName: ``,
                    })
                  }
                }}
                value={
                  addPositionFilter.posName !== ``
                    ? positionNames.find(
                        elem => elem.name === addPositionFilter.posName
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
                  addPositionFilter.posName !== `` ? `correct` : ``
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
                      setAddPositionFilter({
                        ...addPositionFilter,
                        unit: newValue,
                      })
                    } else {
                      setAddPositionFilter({
                        ...addPositionFilter,
                        unit: null,
                      })
                    }
                  }}
                  value={addPositionFilter.unit}
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
                    addPositionFilter.unit !== null ? `correct` : ``
                  )}
                </CheckCircleFlex>
              </Flex>
            )}

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

                  setAddPositionFilter({
                    ...addPositionFilter,
                    posNumber: newPosNumber,
                  })
                } else {
                  setAddPositionFilter({
                    ...addPositionFilter,
                    posNumber: ``,
                  })
                }
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
                  setAddPositionFilter({
                    ...addPositionFilter,
                    haveABudget: newValue,
                  })
                }}
                checked={addPositionFilter.haveABudget}
              />
              <div
                role="presentation"
                style={{ cursor: `pointer`, userSelect: `none` }}
                onClick={() => {
                  setAddPositionFilter({
                    ...addPositionFilter,
                    haveABudget: !addPositionFilter.haveABudget,
                  })
                }}
              >
                มีงบประมาณ
              </div>
            </Flex>
            <Flex>
              <Checkbox
                onChange={(_, newValue) => {
                  setAddPositionFilter({
                    ...addPositionFilter,
                    posOpen: newValue,
                  })
                }}
                checked={addPositionFilter.posOpen}
              />
              <div
                role="presentation"
                style={{ cursor: `pointer`, userSelect: `none` }}
                onClick={() =>
                  setAddPositionFilter({
                    ...addPositionFilter,
                    posOpen: !addPositionFilter.posOpen,
                  })
                }
              >
                เปิดอัตรา
              </div>
            </Flex>
            <Flex style={{ marginBottom: `1rem` }}>
              <Checkbox
                onChange={(_, newValue) => {
                  setAddPositionFilter({
                    ...addPositionFilter,
                    posSouth: newValue,
                  })
                }}
                checked={addPositionFilter.posSouth}
              />
              <div
                role="presentation"
                style={{ cursor: `pointer`, userSelect: `none` }}
                onClick={() =>
                  setAddPositionFilter({
                    ...addPositionFilter,
                    posSouth: !addPositionFilter.posSouth,
                  })
                }
              >
                อัตรากำลังจังหวัดชายแดนภาคใต้
              </div>
            </Flex>

            <Button
              color="success"
              variant="contained"
              type="submit"
              disabled={
                userInfo.role.name === `Administrator`
                  ? addPositionFilter.posName === `` ||
                    addPositionFilter.posType === `` ||
                    addPositionFilter.posNumber === `` ||
                    addPositionFilter.unit === null
                  : addPositionFilter.posName === `` ||
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
