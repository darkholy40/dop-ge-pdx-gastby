import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Grid, Button, TextField, Divider } from "@mui/material"
// import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faTrash, faRedoAlt } from "@fortawesome/free-solid-svg-icons"

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

const EditPositionsPage = ({ location }) => {
  const { token, userInfo, positionTypes, positionNames, redirectPage } =
    useSelector(state => state)
  const dispatch = useDispatch()
  const [positions, setPositions] = useState([])
  const [isError, setIsError] = useState({
    status: ``,
    text: ``,
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
  const [firstStrike, setFirstStrike] = useState(false)
  const [percentDialog, setPercentDialog] = useState({
    open: false,
    title: `กำลังโหลดข้อมูลคลังตำแหน่งที่ว่างทั้งหมด`,
    percent: 0,
  })

  const search = location.search.split("id=")
  const id = search[1] || `0`

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
                description: "people -> edit -> ${id}",
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
  }, [token, userInfo, id])

  const getPerson = useCallback(async () => {
    let returnData = {
      person: null,
      position: null,
    }

    if (id === `0`) {
      setIsError({
        type: `notFound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client(token).query({
        query: gql`
          query Person {
            person(id: "${id}") {
              _id
              Prename
              Name
              Surname
              ID_Card
              SID_Card
              Gender
              BirthDate
              MarriedStatus
              Telephone
              Address
              Emergency_Name
              Emergency_Number
              StartDate
              Edu_Level
              Edu_Name
              Edu_Graduated
              Edu_Country
              MovementType
              Outline
              RewardType1
              RewardType2
              RewardType3
              ContactCnt
              Mission
              CurrentContactStart
              CurrentContactEnd
              Guilty
              Punish
              Decoration
              PercentSalary
              ScoreKPI
              ScoreCompetence
              StatusDisability
              skills
              staff_created
              staff_updated
              type
            }
          }
        `,
      })

      if (res.data.person !== null) {
        returnData.person = res.data.person
      } else {
        setIsError({
          type: `notFound`,
          text: `ไม่พบข้อมูลหน้านี้`,
        })
      }
    } catch (error) {
      console.log(error)

      setIsError({
        type: `notFound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
    }

    try {
      const res = await client(token).query({
        query: gql`
          query Position {
            positions(where: {
              person: "${id}"
            }) {
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

      if (res) {
        returnData.position = res.data.positions[0]
      }
    } catch (error) {
      console.log(error)

      setIsError({
        type: `notFound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
    }

    // console.log(returnData)
    if (returnData.person !== null && returnData.position !== null) {
      setInput(returnData)
    }
    setFirstStrike(true)
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }, [token, id, dispatch])

  const getPositions = useCallback(async () => {
    let role = ``
    let lap = 0

    setPercentDialog(prev => ({
      ...prev,
      open: true,
    }))

    if (id === `0`) {
      return 0
    }

    if (roles[userInfo.role.name].level <= 1) {
      role = `division: "${userInfo.division._id}"`
    }

    try {
      const res = await client(token).query({
        query: gql`
          query PositionsCount {
            positionsConnection(where: {
              _or: [
                {
                  isOpen: true
                  person_null: true
                  ${role}
                },
                {
                  person: "${id}"   
                }
              ]
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
                _or: [
                  {
                    isOpen: true
                    person_null: true
                    ${role}
                  },
                  {
                    person: "${id}"   
                  }
                ]
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
          setIsError({
            status: `notfound`,
            text: `ไม่พบข้อมูล`,
          })
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
  }, [token, userInfo, id, dispatch])

  const goEdit = async () => {
    let getPersonID = ``

    setIsError({
      status: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client(token).mutate({
        mutation: gql`
          mutation UpdatePerson {
            updatePerson(input: {
              where: {
                id: "${id}"
              }
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
              }
            }) {
              person {
                _id
              }
            }
          }
        `,
      })

      // console.log(res.data)

      if (res) {
        getPersonID = res.data.updatePerson.person._id
      }
    } catch (error) {
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การบันทึกข้อมูลไม่สำเร็จ`,
          description: `[Error001] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
          variant: `error`,
          confirmText: `ลองอีกครั้ง`,
          callback: () => goEdit(),
        },
      })

      console.log(error)
    }

    let oldPositionId = ``
    let check = {
      pass1: false,
      pass2: false,
    }

    if (getPersonID !== ``) {
      // get position id เดิม
      try {
        const res = await client(token).query({
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
            title: `การบันทึกข้อมูลไม่สำเร็จ`,
            description: `[Error002] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => goEdit(),
          },
        })
      }

      if (oldPositionId !== ``) {
        // ลบ person_id เดิมออกจาก position table
        try {
          await client(token).mutate({
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
              title: `การบันทึกข้อมูลไม่สำเร็จ`,
              description: `[Error003] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
              variant: `error`,
              confirmText: `ลองอีกครั้ง`,
              callback: () => goEdit(),
            },
          })

          console.log(error)
        }
      }

      if (check.pass1) {
        // บันทึก person_id ใหม่ลงใน position table
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

          check.pass2 = true
        } catch (error) {
          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `การบันทึกข้อมูลไม่สำเร็จ`,
              description: `[Error004] - ไม่สามารถแก้ไขรายการกำลังพลได้`,
              variant: `error`,
              confirmText: `ลองอีกครั้ง`,
              callback: () => goEdit(),
            },
          })

          // สั่งให้แก้ไขกลับเป็นค่าเดิม
          console.log(error)
        }
      }

      if (check.pass1 && check.pass2) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การบันทึกข้อมูล`,
            description: `แก้ไขข้อมูลกำลังพลสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(redirectPage)
            },
          },
        })

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "people -> save -> ${id}",
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
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }

  const setInput = data => {
    setPrename(data.person.Prename)
    setName(data.person.Name)
    setSurname(data.person.Surname)
    setIdCard(data.person.ID_Card)
    setSidCard(data.person.SID_Card)
    setPositionTypeSelect(data.position.position_type.type)
    setPositionNameSelect(data.position.position_type.name)
    setPositionInput(data.position)
    setJobType(data.person.type)
    setGender(data.person.Gender)
    setBirthDate(new Date(data.person.BirthDate))
    setMarriedStatus(data.person.MarriedStatus)
    setTelephone(data.person.Telephone)
    setAddress(data.person.Address)
    setEmergencyName(data.person.Emergency_Name)
    setEmergencyNumber(data.person.Emergency_Number)
    setStartDate(new Date(data.person.StartDate))
    setEduLevel(data.person.Edu_Level)
    setEduName(data.person.Edu_Name)
    setEduGraduated(data.person.Edu_Graduated)
    setEduCountry(data.person.Edu_Country)
    setMovementType(data.person.MovementType)
    setOutline(data.person.Outline)
    setRewardType1(data.person.RewardType1)
    setRewardType2(data.person.RewardType2)
    setRewardType3(data.person.RewardType3)
    setContactCnt(data.person.ContactCnt)
    setMission(data.person.Mission)
    if (data.person.type === `พนักงานราชการ`) {
      setCurrentContactStart(new Date(data.person.CurrentContactStart))
      setCurrentContactEnd(new Date(data.person.CurrentContactEnd))
    }
    setGuilty(data.person.Guilty)
    setPunish(data.person.Punish)
    setDecoration(data.person.Decoration)
    setPercentSalary(data.person.PercentSalary)
    setScoreKPI(data.person.ScoreKPI)
    setScoreCompetence(data.person.ScoreCompetence)
    setStatusDisability(data.person.StatusDisability)
    setSkills(data.person.skills)
  }

  const reloadInput = () => {
    getPerson()
    // setPrename(``)
    // setName(``)
    // setSurname(``)
    // setIdCard(``)
    // setSidCard(``)
    // setPositionTypeSelect(``)
    // setPositionNameSelect(``)
    // setPositionInput(null)
    // setJobType(null)
    // setGender(``)
    // setBirthDate(null)
    // setMarriedStatus(``)
    setTelephone(``)
    // setAddress(``)
    // setEmergencyName(``)
    setEmergencyNumber(``)
    // setStartDate(null)
    // setEduLevel(``)
    // setEduName(``)
    // setEduGraduated(``)
    // setEduCountry(``)
    // setMovementType(``)
    // setOutline(``)
    // setRewardType1(``)
    // setRewardType2(``)
    // setRewardType3(``)
    // setContactCnt(``)
    // setMission(``)
    // setCurrentContactStart(null)
    // setCurrentContactEnd(null)
    // setGuilty(``)
    // setPunish(``)
    // setDecoration(``)
    // setPercentSalary(``)
    // setScoreKPI(``)
    // setScoreCompetence(``)
    // setStatusDisability(``)
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
      getPerson()
    }
  }, [getPerson, token])

  useEffect(() => {
    if (token !== ``) {
      getPositions()
    }
  }, [getPositions, token])

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
        isError.type !== `notFound` ? (
          <>
            <Seo title="แก้ไขประวัติกำลังพล" />
            {redirectPage === `/positions/list/` ? (
              <Breadcrumbs
                previous={[
                  {
                    name:
                      roles[userInfo.role.name].level <= 1
                        ? `จัดการคลังตำแหน่ง (${
                            userInfo.division !== null
                              ? renderDivision(userInfo.division)
                              : `-`
                          })`
                        : `จัดการคลังตำแหน่ง`,
                    link: `/positions/`,
                  },
                  {
                    name: `ค้นหาคลังตำแหน่ง`,
                    link: `/positions/list/`,
                  },
                ]}
                current="แก้ไขประวัติกำลังพล"
              />
            ) : (
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
                  {
                    name: `ค้นหากำลังพล`,
                    link: `/people/list/`,
                  },
                ]}
                current="แก้ไขประวัติกำลังพล"
              />
            )}

            {firstStrike && (
              <>
                <Form
                  onSubmit={e => {
                    e.preventDefault()
                    goEdit()
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
                            const newIdCard = result
                              .toString()
                              .replaceAll(`,`, ``)

                            if (newIdCard.length <= 13) {
                              setIdCard(newIdCard)
                            }
                          } else {
                            setIdCard(``)
                          }
                        }}
                        value={idCard}
                        error={idCard.length === 13 && !checkPid(idCard)}
                        InputProps={{
                          endAdornment: renderCheckingIcon(
                            idCard.length === 13 && checkPid(idCard)
                              ? idCard
                              : ``
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
                            const newSidCard = result
                              .toString()
                              .replaceAll(`,`, ``)

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
                              ? isError.status === `notfound`
                                ? `ไม่มีตำแหน่งว่าง`
                                : `กำลังเชื่อมต่อฐานข้อมูล...`
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
                          {renderCheckingIcon(
                            jobType !== null ? `correct` : ``
                          )}
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
                                    startAdornment:
                                      params.InputProps.endAdornment,
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
                          options={[
                            `โสด`,
                            `สมรส`,
                            `หม้าย`,
                            `หย่า`,
                            `แยกกันอยู่`,
                          ]}
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
                  <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
                    <Grid item xs={12}>
                      <TextField
                        sx={textfieldProps}
                        id="Address"
                        label="* ที่อยู่"
                        variant="outlined"
                        onChange={e => setAddress(e.target.value)}
                        value={address}
                        InputProps={{
                          endAdornment: renderCheckingIcon(address),
                        }}
                      />
                    </Grid>
                  </Grid>
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
                                  startAdornment:
                                    params.InputProps.endAdornment,
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
                                  startAdornment:
                                    params.InputProps.endAdornment,
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
                                  currentContactEnd === null
                                    ? ``
                                    : currentContactEnd
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
                            setStatusDisability(
                              newValue !== null ? newValue : ``
                            )
                          }}
                          value={
                            statusDisability !== `` ? statusDisability : null
                          }
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
                        <FontAwesomeIcon
                          icon={faSave}
                          style={{ marginRight: 5 }}
                        />
                        บันทึก
                      </Button>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <Button
                        fullWidth
                        color="primary"
                        variant="outlined"
                        type="reset"
                        onClick={() => reloadInput()}
                      >
                        <FontAwesomeIcon
                          icon={faRedoAlt}
                          style={{ marginRight: 5 }}
                        />
                        โหลดข้อมูลใหม่
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
                <PercentDialog
                  open={percentDialog.open}
                  title={percentDialog.title}
                  percent={percentDialog.percent}
                />

                <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
                <Flex
                  style={{
                    justifyContent: `end`,
                  }}
                >
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => {}}
                    disabled
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ marginRight: 5 }}
                    />
                    ลบ
                  </Button>
                </Flex>
              </>
            )}
          </>
        ) : (
          <PageNotFound
            desc="ไม่พบ url ที่ท่านเรียกหรือเนื้อหาในส่วนนี้ได้ถูกลบออกจากระบบ"
            link="/people/list/"
            buttonText="กลับไปหน้าค้นหากำลังพล"
          />
        )
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default EditPositionsPage
