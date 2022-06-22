import React, { useEffect, useCallback, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, Divider } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { green } from "@mui/material/colors"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { Form } from "../../components/styles"
import PercentDialog from "../../components/percent-dialog"
import uniqByKeepFirst from "../../functions/uniq-by-keep-first"
import {
  updateAnObjectInArray,
  removeObjectInArray,
} from "../../functions/object-in-array"
import roles from "../../static/roles"

const Container = styled.div`
  // border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  padding: 16px 24px;
  max-width: calc(800px - 48px);
  margin: auto;
`

const Block = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const ButtonBlock = styled.div`
  margin-top: 1rem;
  display: inline-flex;
  justify-content: flex-end;
`

const buttons = {
  downloadData: {
    name: `ติดตั้ง`,
  },
  downloadAll: {
    name: `ติดตั้งทั้งหมด`,
  },
  deleteAll: {
    name: `ยกเลิกการติดตั้งทั้งหมด`,
  },
}

const SettingSystemData = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const {
    positionTypes,
    positionNames,
    units,
    locations,
    educationLevels,
    educationNames,
    educationalInstitutions,
    countries,
  } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [percentDialog, setPercentDialog] = useState([])

  const savePageView = useCallback(() => {
    if (token !== `` && userInfo._id !== ``) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "settings -> system-data",
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

  const renderSyncedData = () => {
    return (
      <FontAwesomeIcon
        icon={faCheckCircle}
        style={{ color: green[400], fontSize: `1.75rem` }}
      />
    )
  }

  const getPositionName = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 1,
        open: true,
        title: `ข้อมูลชื่อประเภทกลุ่มงานและชื่อตำแหน่ง`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query PositionTypesCount {
            positionTypesConnection {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.positionTypesConnection.aggregate.totalCount
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPositionName(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query PositionNames {
              positionTypes(limit: 100, start: ${i * 100}) {
                _id
                type
                name
                order
              }
            }
          `,
        })

        for (let thisPositionType of res.data.positionTypes) {
          returnData = [...returnData, thisPositionType]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 1, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_POSITION_NAMES`,
        positionNames: returnData,
      })

      let positionTypeData = []
      for (let positionType of uniqByKeepFirst(returnData, it => it.type)) {
        positionTypeData = [
          ...positionTypeData,
          {
            _id: positionType._id,
            type: positionType.type,
          },
        ]
      }

      dispatch({
        type: `SET_POSITION_TYPES`,
        positionTypes: positionTypeData,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 1, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))
    }, 200)
  }, [token, dispatch])

  const getUnits = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 2,
        open: true,
        title: `ข้อมูลหน่วย`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query DivisionsCount {
            divisionsConnection {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.divisionsConnection.aggregate.totalCount
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getUnits(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Divisions {
              divisions(limit: 100, start: ${i * 100}) {
                _id
                division1
                division2
                division3
              }
            }
          `,
        })

        for (let division of res.data.divisions) {
          returnData = [...returnData, division]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 2, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_UNITS`,
        units: returnData,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 2, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 2))
    }, 200)
  }, [token, dispatch])

  const getLocations = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 3,
        open: true,
        title: `กำลังโหลดข้อมูลพื้นที่`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query LocationsCount {
            locationsConnection {
              aggregate {
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.locationsConnection.aggregate.totalCount
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getLocations(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Locations {
              locations(limit: 100, start: ${i * 100}) {
                _id
                province
                district
                subdistrict
                zipcode
              }
            }
          `,
        })

        for (let location of res.data.locations) {
          returnData = [...returnData, location]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 3, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_LOCATIONS`,
        locations: returnData,
      })
      // console.log(uniqByKeepFirst(returnData, it => it.province))
      // console.log(uniqByKeepFirst(returnData, it => it.district))
      // console.log(uniqByKeepFirst(returnData, it => it.subdistrict))
      // console.log(uniqByKeepFirst(returnData, it => it.zipcode))
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 3, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 3))
    }, 200)
  }, [token, dispatch])

  const fetchAll = () => {
    getPositionName()
    getLocations()

    if (roles[userInfo.role.name].level >= 2) {
      getUnits()
    }
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `settings`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo title="การตั้งค่า" />
          <Breadcrumbs
            previous={[
              {
                name: `การตั้งค่า`,
                link: `/settings/`,
              },
            ]}
            current="ข้อมูลระบบ"
          />

          <Container>
            <Block>
              <div>
                <p>ข้อมูลชื่อประเภทกลุ่มงานและชื่อตำแหน่ง</p>
                {positionTypes.length > 0 && positionNames.length > 0 && (
                  <>
                    <p>ข้อมูลประเภท: {positionTypes.length} รายการ</p>
                    <p>ข้อมูลชื่อตำแหน่ง: {positionNames.length} รายการ</p>
                  </>
                )}
              </div>
              <div>
                {positionTypes.length > 0 && positionNames.length > 0 ? (
                  <>{renderSyncedData()}</>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                      getPositionName()
                    }}
                  >
                    {buttons.downloadData.name}
                  </Button>
                )}
              </div>
            </Block>
            <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
            {roles[userInfo.role.name].level >= 2 && (
              <>
                <Block>
                  <div>
                    <p>ข้อมูลหน่วย</p>
                    {units.length > 0 && <p>{units.length} รายการ</p>}
                  </div>
                  <div>
                    {units.length > 0 ? (
                      <>{renderSyncedData()}</>
                    ) : (
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          getUnits()
                        }}
                      >
                        {buttons.downloadData.name}
                      </Button>
                    )}
                  </div>
                </Block>
                <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              </>
            )}
            <Block>
              <div>
                <p>ข้อมูลพื่นที่ (จังหวัด อำเภอ ตำบล และรหัสไปรษณีย์)</p>
                {locations.length > 0 && <p>{locations.length} รายการ</p>}
              </div>
              <div>
                {locations.length > 0 ? (
                  <>{renderSyncedData()}</>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                      getLocations()
                    }}
                  >
                    {buttons.downloadData.name}
                  </Button>
                )}
              </div>
            </Block>
            <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
            <Block>
              <div>
                <p>ข้อมูลชื่อระดับการศึกษา</p>
                {educationLevels.length > 0 && (
                  <p>{educationLevels.length} รายการ</p>
                )}
              </div>
              <div>
                {educationLevels.length > 0 ? (
                  <>{renderSyncedData()}</>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {}}
                  >
                    {buttons.downloadData.name}
                  </Button>
                )}
              </div>
            </Block>
            <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
            <Block>
              <div>
                <p>ข้อมูลชื่อวุฒิการศึกษา</p>
                {educationNames.length > 0 && (
                  <p>{educationNames.length} รายการ</p>
                )}
              </div>
              <div>
                {educationNames.length > 0 ? (
                  <>{renderSyncedData()}</>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {}}
                  >
                    {buttons.downloadData.name}
                  </Button>
                )}
              </div>
            </Block>
            <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
            <Block>
              <div>
                <p>ข้อมูลสถาบันการศึกษา</p>
                {educationalInstitutions.length > 0 && (
                  <p>{educationalInstitutions.length} รายการ</p>
                )}
              </div>
              <div>
                {educationalInstitutions.length > 0 ? (
                  <>{renderSyncedData()}</>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {}}
                  >
                    {buttons.downloadData.name}
                  </Button>
                )}
              </div>
            </Block>
            <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
            <Block>
              <div>
                <p>ข้อมูลประเทศ</p>
                {countries.length > 0 && <p>{countries.length} รายการ</p>}
              </div>
              <div>
                {countries.length > 0 ? (
                  <>{renderSyncedData()}</>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {}}
                  >
                    {buttons.downloadData.name}
                  </Button>
                )}
              </div>
            </Block>
          </Container>
          <Form>
            <ButtonBlock>
              <Button
                sx={{
                  marginRight: `1rem`,
                }}
                color="primary"
                variant="contained"
                onClick={() => {
                  fetchAll()
                }}
              >
                {buttons.downloadAll.name}
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  dispatch({
                    type: `SET_ZERO`,
                  })
                }}
                disabled={
                  positionTypes.length === 0 &&
                  positionNames.length === 0 &&
                  units.length === 0 &&
                  locations.length === 0 &&
                  educationLevels.length === 0 &&
                  educationNames.length === 0 &&
                  educationalInstitutions.length === 0 &&
                  countries.length === 0
                }
              >
                {buttons.deleteAll.name}
              </Button>
            </ButtonBlock>
          </Form>
          <PercentDialog data={percentDialog} />
        </>
      ) : (
        <>
          <PageNotFound />
        </>
      )}
    </Layout>
  )
}

export default SettingSystemData
