import React, { useEffect, useCallback, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, Divider } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faTrash } from "@fortawesome/free-solid-svg-icons"
import { green } from "@mui/material/colors"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { Form } from "../../components/styles"
import PercentDialog from "../../components/percent-dialog"
import ConfirmationDialog from "../../components/confirmation-dialog"
import uniqByKeepFirst from "../../functions/uniq-by-keep-first"
import {
  updateAnObjectInArray,
  removeObjectInArray,
} from "../../functions/object-in-array"
import renderTableDate from "../../functions/render-table-date"
import roles from "../../static/roles"

const Container = styled.div`
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  max-width: 800px;
  margin: auto;
`

const DownloadButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background-color: ${({ primaryColor }) => primaryColor[50]};
  border-radius: 8px 8px 0 0;

  p {
    margin: 0;
  }
`

const Content = styled.div`
  padding: 16px 24px;
`

const Block = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  div {
    &:nth-child(1) {
      margin-top: 0.5rem;
    }

    &:nth-child(2) {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin-top: 0;
      margin-bottom: 0.75rem;
    }

    .detail {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.8);
      margin: 0.25rem auto;
    }
  }
`
const UpdatedDate = styled.p`
  font-size: 0.8rem;
  font-style: italic;
  color: rgba(0, 0, 0, 0.8);
  margin: 0.25rem auto;
  text-align: right;
`

const ButtonBlock = styled.div`
  display: inline-flex;
  justify-content: flex-end;
`

const buttons = {
  install: {
    name: `ติดตั้ง`,
  },
  installAll: {
    name: `ติดตั้งทั้งหมด`,
  },
  update: {
    name: `อัปเดต`,
  },
  removeAll: {
    name: `ยกเลิกการติดตั้งทั้งหมด`,
  },
}

const SettingSystemData = () => {
  const { token, tutorialCount, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const {
    positionTypes,
    positionNames,
    units,
    locations,
    educationLevels,
    educationNames,
    educationalInstitutions,
    countries,
    decorations,
    installationDate,
  } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [percentDialog, setPercentDialog] = useState([])
  const [openDeleteAllConfirmationDialog, setOpenDeleteAllConfirmationDialog] =
    useState(false)

  const savePageView = useCallback(() => {
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
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `positionTypes`,
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
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `units`,
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
        title: `กำลังโหลดข้อมูลจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์`,
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
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `locations`,
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

  const getEducationLevels = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 4,
        open: true,
        title: `กำลังโหลดข้อมูลชื่อระดับการศึกษา`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query EducationLevelsCount {
            educationLevelsConnection {
              aggregate {
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.educationLevelsConnection.aggregate.totalCount
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
            callback: () => getEducationLevels(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query EducationLevels {
              educationLevels(limit: 100, start: ${i * 100}) {
                _id
                code
                name
              }
            }
          `,
        })

        for (let educationLevel of res.data.educationLevels) {
          returnData = [...returnData, educationLevel]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 4, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_EDUCATION_LEVELS`,
        educationLevels: returnData,
      })
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `educationLevels`,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 4, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 4))
    }, 200)
  }, [token, dispatch])

  const getEducationNames = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 5,
        open: true,
        title: `กำลังโหลดข้อมูลชื่อวุฒิการศึกษา`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query EducationNamesCount {
            educationNamesConnection {
              aggregate {
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.educationNamesConnection.aggregate.totalCount
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
            callback: () => getEducationNames(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query EducationNames {
              educationNames(limit: 100, start: ${i * 100}) {
                _id
                code
                short_name
                full_name
              }
            }
          `,
        })

        for (let educationName of res.data.educationNames) {
          returnData = [...returnData, educationName]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 5, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_EDUCATION_NAMES`,
        educationNames: returnData,
      })
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `educationNames`,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 5, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 5))
    }, 200)
  }, [token, dispatch])

  const getEducationalInstitutions = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 6,
        open: true,
        title: `กำลังโหลดข้อมูลสถาบันการศึกษา`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query EducationalInstitutionsCount {
            educationalInstitutionsConnection {
              aggregate {
                totalCount
              }
            }
          }
        `,
      })

      const totalCount =
        res.data.educationalInstitutionsConnection.aggregate.totalCount
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
            callback: () => getEducationalInstitutions(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query EducationalInstitutions {
              educationalInstitutions(limit: 100, start: ${i * 100}) {
                _id
                code
                name
              }
            }
          `,
        })

        for (let educationalInstitution of res.data.educationalInstitutions) {
          returnData = [...returnData, educationalInstitution]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 6, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_EDUCATIONAL_INSTITUTIONS`,
        educationalInstitutions: returnData,
      })
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `educationalInstitutions`,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 6, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 6))
    }, 200)
  }, [token, dispatch])

  const getCountries = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 7,
        open: true,
        title: `กำลังโหลดข้อมูลรายชื่อประเทศ`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query CountriesCount {
            countriesConnection {
              aggregate {
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.countriesConnection.aggregate.totalCount
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
            callback: () => getCountries(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Countries {
              countries(limit: 100, start: ${i * 100}) {
                _id
                code
                name
              }
            }
          `,
        })

        for (let country of res.data.countries) {
          returnData = [...returnData, country]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 7, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_COUNTRIES`,
        countries: returnData,
      })
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `countries`,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 7, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 7))
    }, 200)
  }, [token, dispatch])

  const getDecorations = useCallback(async () => {
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 8,
        open: true,
        title: `กำลังโหลดข้อมูลเครื่องราชอิสริยาภรณ์`,
        percent: 0,
      },
    ])

    try {
      const res = await client(token).query({
        query: gql`
          query DecorationsCount {
            decorationsConnection {
              aggregate {
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.decorationsConnection.aggregate.totalCount
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
            callback: () => getDecorations(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Decorations {
              decorations(limit: 100, start: ${i * 100}) {
                _id
                short_name
                full_name
                eng_name
              }
            }
          `,
        })

        for (let decoration of res.data.decorations) {
          returnData = [...returnData, decoration]
        }

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 8, {
            percent: (i * 100) / lap,
          })
        )
      }

      dispatch({
        type: `SET_DECORATIONS`,
        decorations: returnData,
      })
      dispatch({
        type: `SET_INSTALLATION_DATE`,
        key: `decorations`,
      })
    }

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 8, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 8))
    }, 200)
  }, [token, dispatch])

  const installAll = () => {
    if (roles[userInfo.role.name].level >= 2) {
      units.length === 0 && getUnits()
    }

    positionTypes.length === 0 &&
      positionNames.length === 0 &&
      getPositionName()
    locations.length === 0 && getLocations()
    educationLevels.length === 0 && getEducationLevels()
    educationNames.length === 0 && getEducationNames()
    educationalInstitutions.length === 0 && getEducationalInstitutions()
    countries.length === 0 && getCountries()
    decorations.length === 0 && getDecorations()

    client(token).mutate({
      mutation: gql`
        mutation CreateLog {
          createLog(input: {
            data: {
              action: "action",
              description: "download static all",
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

  const updateAll = () => {
    if (roles[userInfo.role.name].level >= 2) {
      getUnits()
    }

    getPositionName()
    getLocations()
    getEducationLevels()
    getEducationNames()
    getEducationalInstitutions()
    getCountries()
    getDecorations()

    client(token).mutate({
      mutation: gql`
        mutation CreateLog {
          createLog(input: {
            data: {
              action: "action",
              description: "update static all",
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

  const renderCheckedSign = () => {
    return (
      <FontAwesomeIcon
        icon={faCheckCircle}
        style={{ color: green[400], fontSize: `1.75rem` }}
      />
    )
  }

  const renderFetchDataButton = (callback, descriptionLog) => {
    return (
      <Button
        color="primary"
        variant="contained"
        onClick={() => {
          callback()
          client(token).mutate({
            mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "download static -> ${descriptionLog}",
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
        }}
      >
        {buttons.install.name}
      </Button>
    )
  }

  const renderFetchAllDataButton = () => {
    let props = {
      text: buttons.installAll.name,
      color: `success`,
      variant: `contained`,
      method: `install`,
    }
    let count = 0

    if (roles[userInfo.role.name].level >= 2) {
      units.length === 0 && count++

      if (
        positionTypes.length > 0 &&
        positionNames.length > 0 &&
        units.length > 0 &&
        locations.length > 0 &&
        educationLevels.length > 0 &&
        educationNames.length > 0 &&
        educationalInstitutions.length > 0 &&
        countries.length > 0 &&
        decorations.length > 0
      ) {
        props = {
          text: buttons.update.name,
          color: `primary`,
          variant: `contained`,
          method: `update`,
        }
      }
    } else {
      if (
        positionTypes.length > 0 &&
        positionNames.length > 0 &&
        locations.length > 0 &&
        educationLevels.length > 0 &&
        educationNames.length > 0 &&
        educationalInstitutions.length > 0 &&
        countries.length > 0 &&
        decorations.length > 0
      ) {
        props = {
          text: buttons.update.name,
          color: `primary`,
          variant: `contained`,
          method: `update`,
        }
      }
    }

    positionNames.length === 0 && count++
    locations.length === 0 && count++
    educationLevels.length === 0 && count++
    educationNames.length === 0 && count++
    educationalInstitutions.length === 0 && count++
    countries.length === 0 && count++
    decorations.length === 0 && count++

    return (
      <>
        <Button
          {...props}
          onClick={() => {
            if (props.method === `install`) {
              installAll()
            }

            if (props.method === `update`) {
              updateAll()
            }
          }}
        >
          {props.text}
        </Button>
        {count > 0 && <span>{count}</span>}
      </>
    )
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `settings-system-data`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    let count = 0

    if (roles[userInfo.role.name].level >= 2) {
      units.length === 0 && count++
    }

    positionNames.length === 0 && count++
    locations.length === 0 && count++
    educationLevels.length === 0 && count++
    educationNames.length === 0 && count++
    educationalInstitutions.length === 0 && count++
    countries.length === 0 && count++
    decorations.length === 0 && count++

    if (count === 0 && tutorialCount === 2) {
      dispatch({
        type: `SET_TUTORIAL_COUNT`,
        tutorialCount: 3,
      })
    }
  }, [
    userInfo.role.name,
    tutorialCount,
    positionNames.length,
    units.length,
    locations.length,
    educationLevels.length,
    educationNames.length,
    educationalInstitutions.length,
    countries.length,
    decorations.length,
    dispatch,
  ])

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
            <DownloadButtonSection
              primaryColor={primaryColor}
              role="presentation"
            >
              {renderFetchAllDataButton()}
            </DownloadButtonSection>
            <Content>
              <Block>
                <div>
                  <p>ข้อมูลชื่อประเภทกลุ่มงานและชื่อตำแหน่ง</p>
                  {positionTypes.length > 0 && positionNames.length > 0 && (
                    <>
                      <p className="detail">
                        ชื่อประเภทกลุ่มงาน: {positionTypes.length} รายการ
                      </p>
                      <p className="detail">
                        ชื่อตำแหน่งในสายงาน: {positionNames.length} รายการ
                      </p>
                    </>
                  )}
                </div>
                <div>
                  {positionTypes.length > 0 && positionNames.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>
                      {renderFetchDataButton(getPositionName, `position-types`)}
                    </>
                  )}
                </div>
              </Block>
              {positionTypes.length > 0 && positionNames.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(installationDate.positionTypes, `datetime`)}
                </UpdatedDate>
              )}
              <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              {roles[userInfo.role.name].level >= 2 && (
                <>
                  <Block>
                    <div>
                      <p>ข้อมูลหน่วย</p>
                      {units.length > 0 && (
                        <p className="detail">{units.length} รายการ</p>
                      )}
                    </div>
                    <div>
                      {units.length > 0 ? (
                        <>{renderCheckedSign()}</>
                      ) : (
                        <>{renderFetchDataButton(getUnits, `units`)}</>
                      )}
                    </div>
                  </Block>
                  {units.length > 0 && (
                    <UpdatedDate>
                      {renderTableDate(installationDate.units, `datetime`)}
                    </UpdatedDate>
                  )}
                  <Divider
                    style={{ marginTop: `1rem`, marginBottom: `1rem` }}
                  />
                </>
              )}
              <Block>
                <div>
                  <p>ข้อมูลจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์</p>
                  {locations.length > 0 && (
                    <>
                      <p className="detail">
                        จังหวัด:{" "}
                        {uniqByKeepFirst(locations, it => it.province).length}{" "}
                        รายการ
                      </p>
                      <p className="detail">
                        อำเภอ:{" "}
                        {uniqByKeepFirst(locations, it => it.district).length}{" "}
                        รายการ
                      </p>
                      <p className="detail">
                        ตำบล:{" "}
                        {
                          uniqByKeepFirst(locations, it => it.subdistrict)
                            .length
                        }{" "}
                        รายการ
                      </p>
                      <p className="detail">
                        รหัสไปรษณีย์:{" "}
                        {uniqByKeepFirst(locations, it => it.zipcode).length}{" "}
                        รายการ
                      </p>
                    </>
                  )}
                </div>
                <div>
                  {locations.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>{renderFetchDataButton(getLocations, `locations`)}</>
                  )}
                </div>
              </Block>
              {locations.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(installationDate.locations, `datetime`)}
                </UpdatedDate>
              )}
              <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              <Block>
                <div>
                  <p>ข้อมูลชื่อระดับการศึกษา</p>
                  {educationLevels.length > 0 && (
                    <p className="detail">{educationLevels.length} รายการ</p>
                  )}
                </div>
                <div>
                  {educationLevels.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>
                      {renderFetchDataButton(
                        getEducationLevels,
                        `education-levels`
                      )}
                    </>
                  )}
                </div>
              </Block>
              {educationLevels.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(
                    installationDate.educationLevels,
                    `datetime`
                  )}
                </UpdatedDate>
              )}
              <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              <Block>
                <div>
                  <p>ข้อมูลชื่อวุฒิการศึกษา</p>
                  {educationNames.length > 0 && (
                    <p className="detail">{educationNames.length} รายการ</p>
                  )}
                </div>
                <div>
                  {educationNames.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>
                      {renderFetchDataButton(
                        getEducationNames,
                        `education-names`
                      )}
                    </>
                  )}
                </div>
              </Block>
              {educationNames.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(installationDate.educationNames, `datetime`)}
                </UpdatedDate>
              )}
              <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              <Block>
                <div>
                  <p>ข้อมูลสถาบันการศึกษา</p>
                  {educationalInstitutions.length > 0 && (
                    <p className="detail">
                      {educationalInstitutions.length} รายการ
                    </p>
                  )}
                </div>
                <div>
                  {educationalInstitutions.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>
                      {renderFetchDataButton(
                        getEducationalInstitutions,
                        `educational-institutions`
                      )}
                    </>
                  )}
                </div>
              </Block>
              {educationalInstitutions.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(
                    installationDate.educationalInstitutions,
                    `datetime`
                  )}
                </UpdatedDate>
              )}
              <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              <Block>
                <div>
                  <p>ข้อมูลรายชื่อประเทศ</p>
                  {countries.length > 0 && (
                    <p className="detail">{countries.length} รายการ</p>
                  )}
                </div>
                <div>
                  {countries.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>{renderFetchDataButton(getCountries, `countries`)}</>
                  )}
                </div>
              </Block>
              {countries.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(installationDate.countries, `datetime`)}
                </UpdatedDate>
              )}

              <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
              <Block>
                <div>
                  <p>ข้อมูลเครื่องราชอิสริยาภรณ์</p>
                  {decorations.length > 0 && (
                    <p className="detail">{decorations.length} รายการ</p>
                  )}
                </div>
                <div>
                  {decorations.length > 0 ? (
                    <>{renderCheckedSign()}</>
                  ) : (
                    <>{renderFetchDataButton(getDecorations, `decorations`)}</>
                  )}
                </div>
              </Block>
              {decorations.length > 0 && (
                <UpdatedDate>
                  {renderTableDate(installationDate.decorations, `datetime`)}
                </UpdatedDate>
              )}
            </Content>
          </Container>
          <PercentDialog data={percentDialog} />
          {roles[userInfo.role.name].level >= 3 && (
            <>
              {(positionTypes.length > 0 ||
                positionNames.length > 0 ||
                units.length > 0 ||
                locations.length > 0 ||
                educationLevels.length > 0 ||
                educationNames.length > 0 ||
                educationalInstitutions.length > 0 ||
                countries.length > 0 ||
                decorations.length > 0) && (
                <>
                  <Divider
                    style={{ marginTop: `2rem`, marginBottom: `1rem` }}
                  />
                  <p style={{ textAlign: `right` }}>สำหรับทดสอบฟังก์ชัน</p>
                  <Form style={{ maxWidth: `100%` }}>
                    <ButtonBlock>
                      <Button
                        sx={{
                          marginLeft: `1rem`,
                        }}
                        color="error"
                        variant="outlined"
                        onClick={() => setOpenDeleteAllConfirmationDialog(true)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ marginRight: 5 }}
                        />
                        {buttons.removeAll.name}
                      </Button>
                    </ButtonBlock>
                  </Form>
                </>
              )}
              <ConfirmationDialog
                open={openDeleteAllConfirmationDialog}
                title="ยืนยันการยกเลิกการติดตั้งทั้งหมด?"
                description={`กดปุ่ม "ตกลง" เพื่อยกเลิกการติดตั้งทั้งหมด`}
                variant="delete"
                confirmCallback={() => {
                  dispatch({
                    type: `SET_ZERO`,
                  })
                  dispatch({
                    type: `SET_TUTORIAL_COUNT`,
                    tutorialCount: 0,
                  })
                }}
                cancelCallback={() => {
                  setOpenDeleteAllConfirmationDialog(false)
                }}
              />
            </>
          )}
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
