import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Grid, Button, TextField, Divider } from "@mui/material"
import MobileDatePicker from "@mui/lab/MobileDatePicker"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faTrash, faRedoAlt } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import { Flex, DisabledBlock, CheckCircleFlex } from "../../components/Styles"
import {
  PhoneNumber,
  Currency,
  Percent,
  Integer,
} from "../../components/NumberFormatAndMask"
import renderDateForGraphQL from "../../functions/renderDateForGraphQL"
import renderDivision from "../../functions/renderDivision"
import renderCheckingIcon from "../../functions/renderCheckingIcon"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  // max-width: 400px;
  // margin: auto;
`

const textfieldProps = {
  width: `100%`,
}

const datePickerProps = {
  disableMaskedInput: true,
  clearable: true,
  clearText: "ล้าง",
  okText: "ตกลง",
  cancelText: "ยกเลิก",
  todayText: "วันนี้",
  inputFormat: "d MMMM yyyy",
  showToolbar: false,
  inputProps: {
    readOnly: true,
    placeholder: "",
    style: {
      marginLeft: 15,
    },
  },
}

const EditPositionsPage = ({ location }) => {
  const { token, userInfo, url, positionTypes, positionNames, redirectPage } =
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

  const search = location.search.split("id=")
  const id = search[1] || `0`

  const getPerson = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
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
      const res = await client.query({
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
      const res = await client.query({
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
  }, [url, id, dispatch])

  const getPositions = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let role = ``
    let lap = 0

    if (id === `0`) {
      return 0
    }

    if (userInfo.role.name !== `Administrator`) {
      role = `division: "${userInfo.division._id}"`
    }

    try {
      const res = await client.query({
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

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client.query({
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

        if (returnData.length > 0) {
          let returnPosition = returnData

          if (positionTypeSelect !== ``) {
            returnPosition = returnData.filter(
              elem => elem.position_type.type === positionTypeSelect
            )
          }

          if (positionNameSelect !== ``) {
            returnPosition = returnData.filter(
              elem =>
                elem.position_type.type === positionTypeSelect &&
                elem.position_type.name === positionNameSelect
            )
          }

          setPositions(returnPosition)
          if (returnPosition.length === 0) {
            setIsError({
              status: `notfound`,
              text: `ไม่พบข้อมูล`,
            })
          }
        } else {
          setPositions([])
          setIsError({
            status: `notfound`,
            text: `ไม่พบข้อมูล`,
          })
        }
      }
    }
  }, [url, userInfo, positionTypeSelect, positionNameSelect, dispatch, id])

  const goEdit = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
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
      const res = await client.mutate({
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
          title: `บันทึกรายการไม่สำเร็จ`,
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
        const res = await client.query({
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
            title: `บันทึกรายการไม่สำเร็จ`,
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
          await client.mutate({
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
              title: `บันทึกรายการไม่สำเร็จ`,
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
          await client.mutate({
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
              title: `บันทึกรายการไม่สำเร็จ`,
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
            title: `บันทึกรายการสำเร็จ`,
            description: `แก้ไขรายการกำลังพลสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(redirectPage)
            },
          },
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
    setBirthDate(data.person.BirthDate)
    setMarriedStatus(data.person.MarriedStatus)
    setTelephone(data.person.Telephone)
    setAddress(data.person.Address)
    setEmergencyName(data.person.Emergency_Name)
    setEmergencyNumber(data.person.Emergency_Number)
    setStartDate(data.person.StartDate)
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
    setCurrentContactStart(data.person.CurrentContactStart)
    setCurrentContactEnd(data.person.CurrentContactEnd)
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

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

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
      {token !== `` ? (
        isError.type !== `notFound` ? (
          <>
            <Seo title="แก้ไขประวัติกำลังพล" />
            {redirectPage === `/positions/list` ? (
              <Breadcrumbs
                previous={[
                  {
                    name: `จัดการคลังตำแหน่ง`,
                    link: `/positions`,
                  },
                  {
                    name: `ค้นหาคลังตำแหน่ง`,
                    link: `/positions/list`,
                  },
                ]}
                current="แก้ไขประวัติกำลังพล"
              />
            ) : (
              <Breadcrumbs
                previous={[
                  {
                    name: `จัดการประวัติกำลังพล`,
                    link: `/people`,
                  },
                  {
                    name: `ค้นหากำลังพล`,
                    link: `/people/list`,
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
                        InputProps={{
                          endAdornment: renderCheckingIcon(
                            idCard.length === 13 ? idCard : ``
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
                          options={positions}
                          noOptionsText={
                            positions.length === 0
                              ? isError.status === `notfound`
                                ? `ไม่มีตำแหน่งว่าง`
                                : `กำลังเชื่อมต่อฐานข้อมูล...`
                              : `ไม่พบข้อมูล`
                          }
                          getOptionLabel={option => {
                            let returnLabel = option.number

                            if (userInfo.role.name === `Administrator`) {
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
                      <MobileDatePicker
                        {...datePickerProps}
                        id="BirthDate"
                        label="* วันเดือนปีเกิด"
                        onChange={newValue => {
                          setBirthDate(newValue)
                        }}
                        onOpen={() => {
                          if (birthDate === null) {
                            setBirthDate(new Date())
                          }
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
                      <MobileDatePicker
                        {...datePickerProps}
                        id="StartDate"
                        label="* วันเริ่มทำสัญญา"
                        onChange={newValue => {
                          setStartDate(newValue)
                        }}
                        onOpen={() => {
                          if (startDate === null) {
                            setStartDate(new Date())
                          }
                        }}
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
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
                    <Grid item xs={12} sm={6}>
                      <Flex>
                        <Autocomplete
                          sx={{ width: `100%` }}
                          id="Edu_Level"
                          disablePortal
                          freeSolo
                          options={[
                            `มัธยมศึกษา`,
                            `เทียบเท่าประกาศนียบัตรวิชาชีพ`,
                            `ปริญญาตรีหรือเทียบเท่า`,
                            `ปริญญาโทหรือเทียบเท่า`,
                            `ปริญญาเอกหรือเทียบเท่า`,
                            `ทักษะประสบการณ์ที่ใช้แทนวุฒิการศึกษา`,
                          ]}
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
                                onChange: e => setEduLevel(e.target.value),
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
                      <TextField
                        sx={textfieldProps}
                        id="Edu_Name"
                        label="* ชื่อวุฒิการศึกษา"
                        variant="outlined"
                        onChange={e => setEduName(e.target.value)}
                        value={eduName}
                        InputProps={{
                          endAdornment: renderCheckingIcon(eduName),
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        sx={textfieldProps}
                        id="Edu_Graduated"
                        label="* ชื่อสถาบันที่สำเร็จการศึกษา"
                        variant="outlined"
                        onChange={e => setEduGraduated(e.target.value)}
                        value={eduGraduated}
                        InputProps={{
                          endAdornment: renderCheckingIcon(eduGraduated),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        sx={textfieldProps}
                        id="Edu_Country"
                        label="* ชื่อประเทศ"
                        variant="outlined"
                        onChange={e => setEduCountry(e.target.value)}
                        value={eduCountry}
                        InputProps={{
                          endAdornment: renderCheckingIcon(eduCountry),
                        }}
                      />
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
                        <MobileDatePicker
                          {...datePickerProps}
                          id="CurrentContactStart"
                          label="* วันที่เริ่มสัญญาปัจจุบัน"
                          onChange={newValue => {
                            setCurrentContactStart(newValue)
                          }}
                          onOpen={() => {
                            if (currentContactStart === null) {
                              setCurrentContactStart(new Date())
                            }
                          }}
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
                        />
                      </DisabledBlock>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DisabledBlock
                        className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                      >
                        <MobileDatePicker
                          {...datePickerProps}
                          id="CurrentContactEnd"
                          label="* วันที่สิ้นสุดสัญญาปัจจุบัน"
                          onChange={newValue => {
                            setCurrentContactEnd(newValue)
                          }}
                          onOpen={() => {
                            if (currentContactEnd === null) {
                              setCurrentContactEnd(new Date())
                            }
                          }}
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
                        />
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
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={
                          jobType !== `ลูกจ้างประจำ`
                            ? name === `` ||
                              surname === `` ||
                              idCard === `` ||
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
                              idCard === `` ||
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
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        color="primary"
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

                <Divider style={{ marginTop: `1rem`, marginBottom: `1rem` }} />
                <Flex
                  style={{
                    justifyContent: `end`,
                  }}
                >
                  <Button color="error" variant="outlined" onClick={() => {}}>
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
            desc="ไม่พบ url ที่เรียกหรือเนื้อหาในส่วนนี้ได้ถูกลบออกจากระบบ"
            link="/people/list"
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
