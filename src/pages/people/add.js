import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Grid, Button, TextField, Divider } from "@mui/material"
// import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import PercentDialog from "../../components/percent-dialog"
import {
  Flex,
  DisabledBlock,
  CheckCircleFlex,
  TextFieldWall,
} from "../../components/styles"
import {
  PhoneNumber,
  Currency,
  Percent,
  Integer,
} from "../../components/number-format-and-mask"
import DatePicker from "../../components/date-picker"
import renderDateForGraphQL from "../../functions/render-date-for-graphql"
import renderDivision from "../../functions/render-division"
import renderCheckingIcon from "../../functions/render-checking-icon"
import renderAgeFromDifferentDateRange from "../../functions/render-age-from-different-date-range"
import checkPid from "../../functions/check-pid"
import uniqByKeepFirst from "../../functions/uniq-by-keep-first"
import roles from "../../static/roles"
import countries from "../../static/countries"
import educationLevels from "../../static/education-levels"
import educationNames from "../../static/education-names"
import educationalInstitutions from "../../static/educational-institutions"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  // max-width: 400px;
  // margin: auto;
`

const textfieldProps = {
  width: `100%`,
}

// const datePickerProps = {
//   disableMaskedInput: true,
//   clearable: true,
//   clearText: "ล้าง",
//   okText: "ตกลง",
//   cancelText: "ยกเลิก",
//   todayText: "วันนี้",
//   inputFormat: "d MMMM yyyy",
//   showToolbar: false,
//   inputProps: {
//     readOnly: true,
//     placeholder: "",
//     style: {
//       marginLeft: 15,
//     },
//   },
//   views: [`year`, `month`, `day`],
//   openTo: `year`,
// }

const AddPositionsPage = () => {
  const { token, userInfo, positionTypes, positionNames } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [positions, setPositions] = useState([])
  const [isError, setIsError] = useState({
    main: {
      status: ``,
      text: ``,
    },
    location: {
      status: ``,
      text: ``,
    },
  })
  const [prename, setPrename] = useState(``)
  const [name, setName] = useState(``)
  const [surname, setSurname] = useState(``)
  const [idCard, setIdCard] = useState(``)
  const [sidCard, setSidCard] = useState(``)
  const [positionTypeSelect, setPositionTypeSelect] = useState(``)
  const [positionNameSelect, setPositionNameSelect] = useState(``)
  const [positionInput, setPositionInput] = useState(null)
  const [jobType, setJobType] = useState(null)
  const [gender, setGender] = useState(``)
  const [birthDate, setBirthDate] = useState(null)
  const [marriedStatus, setMarriedStatus] = useState(``)
  const [telephone, setTelephone] = useState(``)
  const [locationSelect, setLocationSelect] = useState({
    province: null,
    district: null,
    subdistrict: null,
  })
  const [locationData, setLocationData] = useState([])
  const [address, setAddress] = useState(``)
  const [emergencyName, setEmergencyName] = useState(``)
  const [emergencyNumber, setEmergencyNumber] = useState(``)
  const [startDate, setStartDate] = useState(null)
  const [eduLevel, setEduLevel] = useState(``)
  const [eduName, setEduName] = useState(``)
  const [eduGraduated, setEduGraduated] = useState(``)
  const [eduCountry, setEduCountry] = useState(``)
  const [movementType, setMovementType] = useState(``)
  const [outline, setOutline] = useState(``)
  const [rewardType1, setRewardType1] = useState(``)
  const [rewardType2, setRewardType2] = useState(``)
  const [rewardType3, setRewardType3] = useState(``)
  const [contactCnt, setContactCnt] = useState(``)
  const [mission, setMission] = useState(``)
  const [currentContactStart, setCurrentContactStart] = useState(null)
  const [currentContactEnd, setCurrentContactEnd] = useState(null)
  const [guilty, setGuilty] = useState(``)
  const [punish, setPunish] = useState(``)
  const [decoration, setDecoration] = useState(``)
  const [percentSalary, setPercentSalary] = useState(``)
  const [scoreKPI, setScoreKPI] = useState(``)
  const [scoreCompetence, setScoreCompetence] = useState(``)
  const [statusDisability, setStatusDisability] = useState(``)
  const [skills, setSkills] = useState(``)
  const [percentDialog, setPercentDialog] = useState({
    open: false,
    title: `กำลังโหลดข้อมูลคลังตำแหน่งที่ว่างทั้งหมด`,
    percent: 0,
  })

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
                description: "people -> add",
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

  const getPositions = useCallback(async () => {
    let role = ``
    let lap = 0

    setPercentDialog(prev => ({
      ...prev,
      open: true,
    }))

    if (roles[userInfo.role.name].level <= 1) {
      role = `division: "${userInfo.division._id}"`
    }

    try {
      const res = await client(token).query({
        query: gql`
          query PositionsCount {
            positionsConnection(where: {
              isOpen: true
              person_null: true
              ${role}
            }) {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.positionsConnection.aggregate.count
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPositions(),
          },
        })
      }

      return 0
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Positions {
              positions(where: {
                isOpen: true
                person_null: true
                ${role}
              }, limit: 100, start: ${i * 100}) {
                _id
                number
                position_type {
                  type
                  name
                  order
                }
                isOpen
                isSouth
                staff_created
                staff_updated
                published_at
                createdAt
                updatedAt
                division {
                  _id
                  division1
                  division2
                  division3
                }
              }
            }
          `,
        })

        for (let position of res.data.positions) {
          returnData = [...returnData, position]
        }

        setPercentDialog(prev => ({
          ...prev,
          percent: (i * 100) / lap,
        }))

        if (returnData.length > 0) {
          setPositions(returnData)
        } else {
          setPositions([])
          setIsError(prev => ({
            ...prev,
            main: {
              status: `notfound`,
              text: `ไม่พบข้อมูล`,
            },
          }))
        }
      }
    }

    setPercentDialog(prev => ({
      ...prev,
      open: false,
      percent: 100,
    }))

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      })
    }, 200)
  }, [token, userInfo, dispatch])

  const getLocations = useCallback(async () => {
    let lap = 0

    setIsError(prev => ({
      ...prev,
      location: {
        status: ``,
        text: ``,
      },
    }))

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
        setIsError(prev => ({
          ...prev,
          location: {
            status: `notfound`,
            text: `ไม่พบข้อมูล`,
          },
        }))

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
      }

      setLocationData(returnData)
      // console.log(uniqByKeepFirst(returnData, it => it.province))
      // console.log(uniqByKeepFirst(returnData, it => it.district))
      // console.log(uniqByKeepFirst(returnData, it => it.subdistrict))
      // console.log(uniqByKeepFirst(returnData, it => it.zipcode))
    }
  }, [token, dispatch])

  const goAdd = async () => {
    let getPersonID = ``

    setIsError(prev => ({
      ...prev,
      main: {
        status: ``,
        text: ``,
      },
    }))
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client(token).mutate({
        mutation: gql`
          mutation CreatePerson {
            createPerson(input: {
              data: {
                Prename: "${prename}",
                Name: "${name}",
                Surname: "${surname}",
                ID_Card: "${idCard}",
                SID_Card: "${sidCard}",
                Gender: "${gender}",
                BirthDate: ${renderDateForGraphQL(birthDate)},
                MarriedStatus: "${marriedStatus}",
                Telephone: "${telephone}",
                Address: "${address}",
                Emergency_Name: "${emergencyName}",
                Emergency_Number: "${emergencyNumber}",
                StartDate: ${renderDateForGraphQL(startDate)},
                Edu_Level: "${eduLevel}",
                Edu_Name: "${eduName}",
                Edu_Graduated: "${eduGraduated}",
                Edu_Country: "${eduCountry}",
                MovementType: "${movementType}",
                Outline: "${outline}",
                RewardType1: "${rewardType1}",
                RewardType2: "${rewardType2}",
                RewardType3: "${rewardType3}",
                ContactCnt: "${contactCnt}",
                Mission: "${mission}",
                CurrentContactStart: ${renderDateForGraphQL(
                  currentContactStart
                )},
                CurrentContactEnd: ${renderDateForGraphQL(currentContactEnd)},
                Guilty: "${guilty}",
                Punish: "${punish}",
                Decoration: "${decoration}",
                PercentSalary: "${percentSalary}",
                ScoreKPI: "${scoreKPI}",
                ScoreCompetence: "${scoreCompetence}",
                StatusDisability: "${statusDisability}",
                skills: "${skills}",
                staff_created: "${userInfo.id}",
                staff_updated: "",
                type: "${jobType}",
                isResigned: false,
                resignationNote: "",
                position: null,
                location: "${locationSelect.subdistrict._id}",
              }
            }) {
              person {
                _id
              }
            }
          }
        `,
      })
      // console.log(res)
      // {
      //   "data": {
      //     "createPerson": {
      //       "person": {
      //         "_id": "617a166993cffd00eeef2b18"
      //       }
      //     }
      //   }
      // }

      if (res) {
        getPersonID = res.data.createPerson.person._id
      }
    } catch (error) {
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การเพิ่มข้อมูลไม่สำเร็จ`,
          description: `[Error001] - ไม่สามารถเพิ่มรายการกำลังพลได้`,
          variant: `error`,
          confirmText: `ลองอีกครั้ง`,
          callback: () => goAdd(),
        },
      })

      console.log(error)
    }

    if (getPersonID !== ``) {
      try {
        await client(token).mutate({
          mutation: gql`
            mutation UpdatePosition {
              updatePosition(input: {
                where: {
                  id: "${positionInput._id}"
                }
                data: {
                  person: "${getPersonID}"
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

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเพิ่มข้อมูล`,
            description: `เพิ่มข้อมูลกำลังพลสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/people/`)
            },
          },
        })

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "people -> create -> ${getPersonID}",
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
      } catch (error) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเพิ่มข้อมูลไม่สำเร็จ`,
            description: `[Error002] - ไม่สามารถเพิ่มรายการกำลังพลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => goAdd(),
          },
        })

        // สั่งลบ getPersonID ที่เพิ่มไปก่อนหน้าออก
        await client(token).mutate({
          mutation: gql`
            mutation DeletePerson {
              deletePerson(input: {
                where: {
                  id: "${getPersonID}"
                }
              }) {
                person {
                  _id
                  Prename
                  Name
                  Surname
                }
              }
            }
          `,
        })

        console.log(error)
      }
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }

  const clearInput = () => {
    setPrename(``)
    setName(``)
    setSurname(``)
    setIdCard(``)
    setSidCard(``)
    setPositionTypeSelect(``)
    setPositionNameSelect(``)
    setPositionInput(null)
    setJobType(null)
    setGender(``)
    setBirthDate(null)
    setMarriedStatus(``)
    setTelephone(``)
    setLocationSelect({
      province: null,
      district: null,
      subdistrict: null,
    })
    setAddress(``)
    setEmergencyName(``)
    setEmergencyNumber(``)
    setStartDate(null)
    setEduLevel(``)
    setEduName(``)
    setEduGraduated(``)
    setEduCountry(``)
    setMovementType(``)
    setOutline(``)
    setRewardType1(``)
    setRewardType2(``)
    setRewardType3(``)
    setContactCnt(``)
    setMission(``)
    setCurrentContactStart(null)
    setCurrentContactEnd(null)
    setGuilty(``)
    setPunish(``)
    setDecoration(``)
    setPercentSalary(``)
    setScoreKPI(``)
    setScoreCompetence(``)
    setStatusDisability(``)
    setSkills(``)
  }

  const renderFilterPositions = getPositions => {
    let returnPositions = getPositions

    if (positionTypeSelect !== ``) {
      returnPositions = getPositions.filter(
        elem => elem.position_type.type === positionTypeSelect
      )
    }

    if (positionNameSelect !== ``) {
      returnPositions = getPositions.filter(
        elem =>
          elem.position_type.type === positionTypeSelect &&
          elem.position_type.name === positionNameSelect
      )
    }

    return returnPositions
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (token !== ``) {
      getPositions()
      getLocations()
    }
  }, [getPositions, getLocations, token])

  useEffect(() => {
    if (jobType === `ลูกจ้างประจำ`) {
      setMovementType(``)
      setOutline(``)
      setRewardType3(``)
      setContactCnt(``)
      setCurrentContactStart(null)
      setCurrentContactEnd(null)
    } else {
      setDecoration(``)
    }
  }, [jobType])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo title="เพิ่มประวัติกำลังพล" />
          <Breadcrumbs
            previous={[
              {
                name:
                  roles[userInfo.role.name].level <= 1
                    ? `จัดการประวัติกำลังพล (${
                        userInfo.division !== null
                          ? renderDivision(userInfo.division)
                          : `-`
                      })`
                    : `จัดการประวัติกำลังพล`,
                link: `/people/`,
              },
            ]}
            current="เพิ่มประวัติกำลังพล"
          />

          <Form
            onSubmit={e => {
              e.preventDefault()
              goAdd()
            }}
          >
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Prename"
                    disablePortal
                    options={[
                      `นาย`,
                      `นาง`,
                      `นางสาว`,
                      `ว่าที่ ร.ต.`,
                      `ว่าที่ ร.ต.หญิง`,
                    ]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setPrename(newValue !== null ? newValue : ``)
                    }}
                    value={prename !== `` ? prename : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* คำนำหน้าชื่อ"
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
                    {renderCheckingIcon(prename)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="Name"
                  label="* ชื่อ"
                  variant="outlined"
                  onChange={e => setName(e.target.value)}
                  value={name}
                  InputProps={{
                    endAdornment: renderCheckingIcon(name),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  sx={textfieldProps}
                  id="Surname"
                  label="* นามสกุล"
                  variant="outlined"
                  onChange={e => setSurname(e.target.value)}
                  value={surname}
                  InputProps={{
                    endAdornment: renderCheckingIcon(surname),
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="ID_Card"
                  label="* หมายเลขประจำตัวประชาชน (13 หลัก)"
                  variant="outlined"
                  onChange={e => {
                    const newValue = e.target.value
                    const pattern = /[0-9]/g
                    const result = newValue.match(pattern)

                    if (result !== null) {
                      const newIdCard = result.toString().replaceAll(`,`, ``)

                      if (newIdCard.length <= 13) {
                        setIdCard(newIdCard)
                      }
                    } else {
                      setIdCard(``)
                    }
                  }}
                  value={idCard}
                  error={idCard.length === 13 && !checkPid(idCard)}
                  helperText={
                    idCard.length === 13 && !checkPid(idCard)
                      ? `หมายเลขประจำตัวประชาชนไม่ถูกต้อง`
                      : ``
                  }
                  InputProps={{
                    endAdornment: renderCheckingIcon(
                      idCard.length === 13 && checkPid(idCard) ? idCard : ``
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="SID_Card"
                  label="* หมายเลขประจำตัวข้าราชการกองทัพบก (10 หลัก)"
                  variant="outlined"
                  onChange={e => {
                    const newValue = e.target.value
                    const pattern = /[0-9]/g
                    const result = newValue.match(pattern)

                    if (result !== null) {
                      const newSidCard = result.toString().replaceAll(`,`, ``)

                      if (newSidCard.length <= 10) {
                        setSidCard(newSidCard)
                      }
                    } else {
                      setSidCard(``)
                    }
                  }}
                  value={sidCard}
                  InputProps={{
                    endAdornment: renderCheckingIcon(
                      sidCard.length === 10 ? sidCard : ``
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <Flex>
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
                        setPositionTypeSelect(newValue.type)
                        setPositionNameSelect(``)
                        setPositionInput(null)
                      } else {
                        setPositionTypeSelect(``)
                        setPositionNameSelect(``)
                        setPositionInput(null)
                      }
                    }}
                    value={
                      positionTypeSelect !== ``
                        ? positionTypes.find(
                            elem => elem.type === positionTypeSelect
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
                      positionTypeSelect !== `` ? `correct` : ``
                    )}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="position-name"
                    disablePortal
                    options={
                      positionTypeSelect !== ``
                        ? positionNames.filter(
                            elem => elem.type === positionTypeSelect
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
                        setPositionTypeSelect(newValue.type)
                        setPositionNameSelect(newValue.name)
                        setPositionInput(null)
                      } else {
                        setPositionNameSelect(``)
                        setPositionInput(null)
                      }
                    }}
                    value={
                      positionNameSelect !== ``
                        ? positionNames.find(
                            elem => elem.name === positionNameSelect
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
                      positionNameSelect !== `` ? `correct` : ``
                    )}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="position-number"
                    disablePortal
                    options={renderFilterPositions(positions)}
                    noOptionsText={
                      positions.length === 0
                        ? isError.main.status === `notfound`
                          ? `ไม่มีตำแหน่งว่าง`
                          : `กำลังโหลดข้อมูล...`
                        : `ไม่พบข้อมูล`
                    }
                    getOptionLabel={option => {
                      let returnLabel = option.number

                      if (roles[userInfo.role.name].level > 1) {
                        returnLabel = `${option.number} (${renderDivision(
                          option.division
                        )})`
                      }

                      return returnLabel
                    }}
                    isOptionEqualToValue={(option, value) => {
                      return option._id === value._id
                    }}
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setPositionTypeSelect(newValue.position_type.type)
                        setPositionNameSelect(newValue.position_type.name)
                        setPositionInput(newValue)
                      } else {
                        setPositionInput(null)
                      }
                    }}
                    value={positionInput}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="รหัสตำแหน่ง"
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
                      positionInput !== null ? `correct` : ``
                    )}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="person-type"
                    disablePortal
                    options={[`พนักงานราชการ`, `ลูกจ้างประจำ`]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setJobType(newValue)
                    }}
                    value={jobType}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ประเภท"
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
                    {renderCheckingIcon(jobType !== null ? `correct` : ``)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={2}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Gender"
                    disablePortal
                    options={[`ชาย`, `หญิง`]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setGender(newValue !== null ? newValue : ``)
                    }}
                    value={gender !== `` ? gender : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* เพศ"
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
                    {renderCheckingIcon(gender)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={4}>
                <div style={{ display: `inline-flex`, width: `100%` }}>
                  <div style={{ width: `100%` }}>
                    <DatePicker
                      maxDate={new Date()}
                      id="BirthDate"
                      label="* วันเดือนปีเกิด"
                      onChange={newValue => {
                        setBirthDate(newValue)
                      }}
                      value={birthDate}
                      renderInput={params => {
                        return (
                          <TextField
                            {...params}
                            sx={textfieldProps}
                            InputProps={{
                              startAdornment: params.InputProps.endAdornment,
                              endAdornment: renderCheckingIcon(
                                birthDate === null ? `` : birthDate
                              ),
                            }}
                          />
                        )
                      }}
                    />
                  </div>
                  <TextFieldWall
                    style={{
                      height: 34,
                      minWidth: 18,
                      whiteSpace: `nowrap`,
                      backgroundColor: `rgba(0, 0, 0, 0.15)`,
                    }}
                  >
                    {birthDate !== null
                      ? `${renderAgeFromDifferentDateRange(birthDate)} ปี`
                      : ``}
                  </TextFieldWall>
                </div>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="MarriedStatus"
                    disablePortal
                    options={[`โสด`, `สมรส`, `หม้าย`, `หย่า`, `แยกกันอยู่`]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setMarriedStatus(newValue !== null ? newValue : ``)
                    }}
                    value={marriedStatus !== `` ? marriedStatus : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* สถานภาพสมรส"
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
                    {renderCheckingIcon(marriedStatus)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="Telephone"
                  label="* หมายเลขโทรศัพท์"
                  variant="outlined"
                  onChange={e => setTelephone(e.target.value)}
                  value={telephone}
                  InputProps={{
                    inputComponent: PhoneNumber,
                    endAdornment: renderCheckingIcon(telephone),
                  }}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Province"
                    disablePortal
                    options={uniqByKeepFirst(locationData, it => it.province)}
                    noOptionsText={
                      locationData.length === 0
                        ? isError.location.status === `notfound`
                          ? `ไม่มีตำแหน่งว่าง`
                          : `กำลังโหลดข้อมูล...`
                        : `ไม่พบข้อมูล`
                    }
                    getOptionLabel={option => option.province}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setLocationSelect({
                        ...locationSelect,
                        province: newValue,
                        district: null,
                        subdistrict: null,
                      })
                    }}
                    value={locationSelect.province}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* จังหวัด"
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
                    {renderCheckingIcon(locationSelect.province)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={3}>
                <DisabledBlock
                  className={locationSelect.province === null ? `disabled` : ``}
                >
                  <Flex>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="District"
                      disablePortal
                      disabled={locationSelect.province === null}
                      options={
                        locationSelect.province !== null
                          ? uniqByKeepFirst(
                              locationData,
                              it => it.district
                            ).filter(
                              elem =>
                                elem.province ===
                                locationSelect.province.province
                            )
                          : []
                      }
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => option.district}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        setLocationSelect({
                          ...locationSelect,
                          district: newValue,
                          subdistrict: null,
                        })
                      }}
                      value={locationSelect.district}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="* อำเภอ"
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
                      {renderCheckingIcon(locationSelect.district)}
                    </CheckCircleFlex>
                  </Flex>
                </DisabledBlock>
              </Grid>
              <Grid item xs={12} sm={3}>
                <DisabledBlock
                  className={locationSelect.district === null ? `disabled` : ``}
                >
                  <Flex>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="Sub-district"
                      disablePortal
                      disabled={locationSelect.district === null}
                      options={
                        locationSelect.district !== null
                          ? locationData.filter(
                              elem =>
                                elem.province ===
                                  locationSelect.province.province &&
                                elem.district ===
                                  locationSelect.district.district
                            )
                          : []
                      }
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => option.subdistrict}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        setLocationSelect({
                          ...locationSelect,
                          subdistrict: newValue,
                        })
                      }}
                      value={locationSelect.subdistrict}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="* ตำบล"
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
                      {renderCheckingIcon(locationSelect.subdistrict)}
                    </CheckCircleFlex>
                  </Flex>
                </DisabledBlock>
              </Grid>
              <Grid item xs={12} sm={3}>
                <DisabledBlock
                  className={
                    locationSelect.subdistrict === null ? `disabled` : ``
                  }
                >
                  <TextField
                    sx={textfieldProps}
                    id="Zipcode"
                    label="* รหัสไปรษณีย์"
                    variant="outlined"
                    value={
                      locationSelect.subdistrict !== null
                        ? locationSelect.subdistrict.zipcode
                        : ``
                    }
                    InputProps={{
                      disabled: true,
                    }}
                  />
                </DisabledBlock>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <TextField
                  sx={textfieldProps}
                  id="Address"
                  label="* รายละเอียดที่อยู่"
                  variant="outlined"
                  onChange={e => setAddress(e.target.value)}
                  value={address}
                  InputProps={{
                    endAdornment: renderCheckingIcon(address),
                  }}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="Emergency_Name"
                  label="* ชื่อผู้ติดต่อฉุกเฉิน"
                  variant="outlined"
                  onChange={e => setEmergencyName(e.target.value)}
                  value={emergencyName}
                  InputProps={{
                    endAdornment: renderCheckingIcon(emergencyName),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="Emergency_Number"
                  label="* หมายเลขโทรศัพท์ผู้ติดต่อฉุกเฉิน"
                  variant="outlined"
                  onChange={e => setEmergencyNumber(e.target.value)}
                  value={emergencyNumber}
                  InputProps={{
                    inputComponent: PhoneNumber,
                    endAdornment: renderCheckingIcon(emergencyNumber),
                  }}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <DatePicker
                  id="StartDate"
                  label="* วันเริ่มทำสัญญา"
                  onChange={newValue => {
                    setStartDate(newValue)
                  }}
                  value={startDate}
                  renderInput={params => {
                    return (
                      <TextField
                        {...params}
                        sx={textfieldProps}
                        InputProps={{
                          startAdornment: params.InputProps.endAdornment,
                          endAdornment: renderCheckingIcon(
                            startDate === null ? `` : startDate
                          ),
                        }}
                      />
                    )
                  }}
                />
                {/* <MobileDatePicker
                  {...datePickerProps}
                  id="StartDate"
                  label="* วันเริ่มทำสัญญา"
                  onChange={newValue => {
                    setStartDate(newValue)
                  }}
                  // onOpen={() => {
                  //   if (startDate === null) {
                  //     setStartDate(new Date())
                  //   }
                  // }}
                  value={startDate}
                  renderInput={params => (
                    <TextField
                      {...params}
                      sx={textfieldProps}
                      InputProps={{
                        startAdornment: params.InputProps.endAdornment,
                        endAdornment: renderCheckingIcon(
                          startDate === null ? `` : startDate
                        ),
                      }}
                    />
                  )}
                /> */}
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Edu_Level"
                    disablePortal
                    options={educationLevels}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEduLevel(newValue !== null ? newValue : ``)
                    }}
                    value={eduLevel !== `` ? eduLevel : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* ระดับการศึกษา"
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
                    {renderCheckingIcon(eduLevel)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Edu_Name"
                    disablePortal
                    options={educationNames}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEduName(newValue !== null ? newValue : ``)
                    }}
                    value={eduName !== `` ? eduName : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* ชื่อวุฒิการศึกษา"
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
                    {renderCheckingIcon(eduName)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Edu_Graduated"
                    disablePortal
                    options={educationalInstitutions}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEduGraduated(newValue !== null ? newValue : ``)
                    }}
                    value={eduGraduated !== `` ? eduGraduated : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* ชื่อสถาบันที่สำเร็จการศึกษา"
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
                    {renderCheckingIcon(eduGraduated)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Edu_Country"
                    disablePortal
                    options={countries}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEduCountry(newValue !== null ? newValue : ``)
                    }}
                    value={eduCountry !== `` ? eduCountry : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* ชื่อประเทศ"
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
                    {renderCheckingIcon(eduCountry)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <Flex>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="MovementType"
                      disablePortal
                      options={[`การต่อสัญญา`, `การทำสัญญาครั้งแรก`]}
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => option}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        setMovementType(newValue !== null ? newValue : ``)
                      }}
                      value={movementType !== `` ? movementType : null}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="* ชื่อประเภทการเคลื่อนไหวล่าสุด"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: `5px 0 0 5px`,
                            },
                          }}
                        />
                      )}
                      disabled={jobType === `ลูกจ้างประจำ`}
                    />
                    <CheckCircleFlex>
                      {renderCheckingIcon(movementType)}
                    </CheckCircleFlex>
                  </Flex>
                </DisabledBlock>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <Flex>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="Outline"
                      disablePortal
                      options={[
                        `กรอบอัตรากำลัง 4 ปี`,
                        `กรอบอัตรากำลังตามมติ ครม. 5 ต.ค. 47 (กลุ่ม 2)`,
                        `กรอบอัตรากำลังตามประกาศ คพร. ข้อ 19`,
                      ]}
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => option}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        setOutline(newValue !== null ? newValue : ``)
                      }}
                      value={outline !== `` ? outline : null}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="* กรอบอัตรากำลัง"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: `5px 0 0 5px`,
                            },
                          }}
                        />
                      )}
                      disabled={jobType === `ลูกจ้างประจำ`}
                    />
                    <CheckCircleFlex>
                      {renderCheckingIcon(outline)}
                    </CheckCircleFlex>
                  </Flex>
                </DisabledBlock>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="RewardType1"
                  label="* ค่าตอบแทนปัจจุบัน(เงินเดือน)"
                  variant="outlined"
                  onChange={e => setRewardType1(e.target.value)}
                  value={rewardType1}
                  InputProps={{
                    inputComponent: Currency,
                    endAdornment: renderCheckingIcon(rewardType1),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="RewardType2"
                  label="ค่าตอบแทนสำหรับตำแหน่งที่มีเหตุพิเศษ"
                  variant="outlined"
                  onChange={e => setRewardType2(e.target.value)}
                  value={rewardType2}
                  InputProps={{
                    inputComponent: Currency,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <TextField
                    sx={textfieldProps}
                    id="RewardType3"
                    label="ค่าครองชีพชั่วคราว"
                    variant="outlined"
                    onChange={e => setRewardType3(e.target.value)}
                    value={rewardType3}
                    InputProps={{
                      inputComponent: Currency,
                    }}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  />
                </DisabledBlock>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <TextField
                    sx={textfieldProps}
                    id="ContactCnt"
                    label="* จำนวนครั้งที่ทำสัญญา"
                    variant="outlined"
                    onChange={e => setContactCnt(e.target.value)}
                    value={contactCnt}
                    InputProps={{
                      inputComponent: Integer,
                      endAdornment: renderCheckingIcon(contactCnt),
                    }}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  />
                </DisabledBlock>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Mission"
                    disablePortal
                    options={[
                      `ตำแหน่งในภารกิจหลัก`,
                      `ตำแหน่งในภารกิจรอง`,
                      `ตำแหน่งในภารกิจสนับสนุน`,
                    ]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setMission(newValue !== null ? newValue : ``)
                    }}
                    value={mission !== `` ? mission : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="* ประเภทภารกิจ"
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
                    {renderCheckingIcon(mission)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <DatePicker
                    id="CurrentContactStart"
                    label="* วันที่เริ่มสัญญาปัจจุบัน"
                    onChange={newValue => {
                      setCurrentContactStart(newValue)
                    }}
                    value={currentContactStart}
                    renderInput={params => {
                      return (
                        <TextField
                          {...params}
                          sx={textfieldProps}
                          InputProps={{
                            startAdornment: params.InputProps.endAdornment,
                            endAdornment: renderCheckingIcon(
                              currentContactStart === null
                                ? ``
                                : currentContactStart
                            ),
                          }}
                        />
                      )
                    }}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  />

                  {/* <MobileDatePicker
                    {...datePickerProps}
                    id="CurrentContactStart"
                    label="* วันที่เริ่มสัญญาปัจจุบัน"
                    onChange={newValue => {
                      setCurrentContactStart(newValue)
                    }}
                    // onOpen={() => {
                    //   if (currentContactStart === null) {
                    //     setCurrentContactStart(new Date())
                    //   }
                    // }}
                    value={currentContactStart}
                    renderInput={params => (
                      <TextField
                        {...params}
                        sx={textfieldProps}
                        InputProps={{
                          startAdornment: params.InputProps.endAdornment,
                          endAdornment: renderCheckingIcon(
                            currentContactStart === null
                              ? ``
                              : currentContactStart
                          ),
                        }}
                      />
                    )}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  /> */}
                </DisabledBlock>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <DatePicker
                    id="CurrentContactEnd"
                    label="* วันที่สิ้นสุดสัญญาปัจจุบัน"
                    onChange={newValue => {
                      setCurrentContactEnd(newValue)
                    }}
                    value={currentContactEnd}
                    renderInput={params => {
                      return (
                        <TextField
                          {...params}
                          sx={textfieldProps}
                          InputProps={{
                            startAdornment: params.InputProps.endAdornment,
                            endAdornment: renderCheckingIcon(
                              currentContactEnd === null
                                ? ``
                                : currentContactEnd
                            ),
                          }}
                        />
                      )
                    }}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  />

                  {/* <MobileDatePicker
                    {...datePickerProps}
                    id="CurrentContactEnd"
                    label="* วันที่สิ้นสุดสัญญาปัจจุบัน"
                    onChange={newValue => {
                      setCurrentContactEnd(newValue)
                    }}
                    // onOpen={() => {
                    //   if (currentContactEnd === null) {
                    //     setCurrentContactEnd(new Date())
                    //   }
                    // }}
                    value={currentContactEnd}
                    renderInput={params => (
                      <TextField
                        {...params}
                        sx={textfieldProps}
                        InputProps={{
                          startAdornment: params.InputProps.endAdornment,
                          endAdornment: renderCheckingIcon(
                            currentContactEnd === null ? `` : currentContactEnd
                          ),
                        }}
                      />
                    )}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  /> */}
                </DisabledBlock>
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Guilty"
                    disablePortal
                    options={[
                      `ความผิดทางวินัยอย่างร้ายแรง`,
                      `ความผิดทางวินัยไม่ร้ายแรง`,
                    ]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setGuilty(newValue !== null ? newValue : ``)
                    }}
                    value={guilty !== `` ? guilty : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ความผิดทางวินัย"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            borderRadius: `5px`,
                          },
                        }}
                      />
                    )}
                  />
                </Flex>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Punish"
                    disablePortal
                    options={[
                      `ภาคทัณฑ์`,
                      `ตัดค่าตอบแทน(เงินเดือน)`,
                      `ลดขั้นเงินเดือน`,
                      `ให้ออกเหตุวินัย`,
                      `ปลดออก`,
                      `ไล่ออก`,
                      `ทำทัณฑ์บน`,
                      `ว่ากล่าวตักเตือน`,
                      `ยุติเรื่อง`,
                    ]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setPunish(newValue !== null ? newValue : ``)
                    }}
                    value={punish !== `` ? punish : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ประเภทโทษทางวินัย"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            borderRadius: `5px`,
                          },
                        }}
                      />
                    )}
                  />
                </Flex>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <DisabledBlock
                  className={jobType !== `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <TextField
                    sx={textfieldProps}
                    id="Decoration"
                    label="เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ"
                    variant="outlined"
                    onChange={e => setDecoration(e.target.value)}
                    value={decoration}
                    disabled={jobType !== `ลูกจ้างประจำ`}
                  />
                </DisabledBlock>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="PercentSalary"
                  label="ร้อยละที่ได้รับการเลื่อนเงินเดือน"
                  variant="outlined"
                  onChange={e => setPercentSalary(e.target.value)}
                  value={percentSalary}
                  InputProps={{
                    inputComponent: Percent,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="ScoreKPI"
                  label="คะแนนผลสัมฤทธิ์ของงาน"
                  variant="outlined"
                  onChange={e => setScoreKPI(e.target.value)}
                  value={scoreKPI}
                  InputProps={{
                    inputComponent: Percent,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="ScoreCompetence"
                  label="คะแนนประเมินสมรรถนะ"
                  variant="outlined"
                  onChange={e => setScoreCompetence(e.target.value)}
                  value={scoreCompetence}
                  InputProps={{
                    inputComponent: Percent,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="StatusDisability"
                    disablePortal
                    options={[`ปกติ`, `ทุพพลภาพ`]}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setStatusDisability(newValue !== null ? newValue : ``)
                    }}
                    value={statusDisability !== `` ? statusDisability : null}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="สภานภาพทางกาย"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            borderRadius: `5px`,
                          },
                        }}
                      />
                    )}
                  />
                </Flex>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <TextField
                  sx={textfieldProps}
                  id="skills"
                  label="ทักษะประสบการณ์"
                  variant="outlined"
                  onChange={e => setSkills(e.target.value)}
                  value={skills}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item md={6} sm={12} xs={12} />
              <Grid item md={3} sm={12} xs={12}>
                <Button
                  fullWidth
                  color="success"
                  variant="contained"
                  type="submit"
                  disabled={
                    jobType !== `ลูกจ้างประจำ`
                      ? name === `` ||
                        surname === `` ||
                        !checkPid(idCard) ||
                        sidCard === `` ||
                        positionInput === null ||
                        jobType === null ||
                        gender === `` ||
                        birthDate === null ||
                        marriedStatus === `` ||
                        telephone === `` ||
                        locationSelect.province === null ||
                        locationSelect.district === null ||
                        locationSelect.subdistrict === null ||
                        address === `` ||
                        emergencyName === `` ||
                        emergencyNumber === `` ||
                        startDate === null ||
                        eduLevel === `` ||
                        eduName === `` ||
                        eduGraduated === `` ||
                        eduCountry === `` ||
                        movementType === `` ||
                        outline === `` ||
                        rewardType1 === `` ||
                        contactCnt === `` ||
                        mission === `` ||
                        currentContactStart === null ||
                        currentContactEnd === null
                      : name === `` ||
                        surname === `` ||
                        !checkPid(idCard) ||
                        sidCard === `` ||
                        positionInput === null ||
                        jobType === null ||
                        gender === `` ||
                        birthDate === null ||
                        marriedStatus === `` ||
                        telephone === `` ||
                        locationSelect.province === null ||
                        locationSelect.district === null ||
                        locationSelect.subdistrict === null ||
                        address === `` ||
                        emergencyName === `` ||
                        emergencyNumber === `` ||
                        startDate === null ||
                        eduLevel === `` ||
                        eduName === `` ||
                        eduGraduated === `` ||
                        eduCountry === `` ||
                        rewardType1 === `` ||
                        mission === ``
                  }
                >
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
                  เพิ่มรายการ
                </Button>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <Button
                  fullWidth
                  color="error"
                  variant="outlined"
                  type="reset"
                  onClick={() => clearInput()}
                  disabled={
                    prename === `` &&
                    name === `` &&
                    surname === `` &&
                    idCard === `` &&
                    sidCard === `` &&
                    positionInput === null &&
                    jobType === null &&
                    gender === `` &&
                    birthDate === null &&
                    marriedStatus === `` &&
                    telephone === `` &&
                    locationSelect.province === null &&
                    locationSelect.district === null &&
                    locationSelect.subdistrict === null &&
                    address === `` &&
                    emergencyName === `` &&
                    emergencyNumber === `` &&
                    startDate === null &&
                    eduLevel === `` &&
                    eduName === `` &&
                    eduGraduated === `` &&
                    eduCountry === `` &&
                    movementType === `` &&
                    outline === `` &&
                    rewardType1 === `` &&
                    rewardType2 === `` &&
                    rewardType3 === `` &&
                    contactCnt === `` &&
                    mission === `` &&
                    currentContactStart === null &&
                    currentContactEnd === null &&
                    guilty === `` &&
                    punish === `` &&
                    decoration === `` &&
                    percentSalary === `` &&
                    scoreKPI === `` &&
                    scoreCompetence === `` &&
                    statusDisability === `` &&
                    skills === ``
                  }
                >
                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: 5 }} />
                  ล้าง
                </Button>
              </Grid>
            </Grid>
          </Form>
          <PercentDialog
            open={percentDialog.open}
            title={percentDialog.title}
            percent={percentDialog.percent}
          />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default AddPositionsPage
