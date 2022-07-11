import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Grid, Button, TextField, Divider } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faSave,
  faTimes,
  faRedoAlt,
  faTrash,
  faChevronLeft,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import PercentDialog from "../../components/percent-dialog"
import Warning from "../warning"
import {
  Form as StyledForm,
  Flex,
  DisabledBlock,
  CheckCircleFlex,
  TextFieldWall,
} from "../../components/styles"
import WhoCreated from "../who-created"
import {
  PhoneNumber,
  Currency,
  Percent,
  Integer,
} from "../../components/number-format-and-mask"
import DayPicker from "../day-picker"
import renderDateForGraphQL from "../../functions/render-date-for-graphql"
import renderDivision from "../../functions/render-division"
import renderCheckingIcon from "../../functions/render-checking-icon"
import renderAgeFromDifferentDateRange from "../../functions/render-age-from-different-date-range"
import renderValueForRelationField from "../../functions/render-value-for-relation-field"
import checkPid from "../../functions/check-pid"
import uniqByKeepFirst from "../../functions/uniq-by-keep-first"
import {
  updateAnObjectInArray,
  removeObjectInArray,
} from "../../functions/object-in-array"
import roleLevel from "../../functions/role-level"

const Form = styled(StyledForm)`
  max-width: 100%;
`

const textfieldProps = {
  width: `100%`,
}

const dayPickerInputProps = {
  startAdornment: (
    <FontAwesomeIcon
      icon={faCalendar}
      style={{
        fontSize: `1.25rem`,
        marginRight: 8,
        color: `rgba(0, 0, 0, 0.65)`,
      }}
    />
  ),
}

const PersonForm = ({ modification, id, divisionId }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const {
    positionTypes,
    positionNames,
    locations,
    educationLevels,
    educationNames,
    educationalInstitutions,
    countries,
    decorations,
  } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [firstStrike, setFirstStrike] = useState(false)
  const [positions, setPositions] = useState([])
  const [agents, setAgents] = useState({
    whoCreated: {
      id: ``,
      date: null,
    },
    whoUpdated: {
      id: ``,
      date: null,
    },
  })
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
  const [locationSelect, setLocationSelect] = useState({
    province: null,
    district: null,
    subdistrict: null,
  })
  const [address, setAddress] = useState(``)
  const [emergencyName, setEmergencyName] = useState(``)
  const [emergencyNumber, setEmergencyNumber] = useState(``)
  const [startDate, setStartDate] = useState(null)
  const [educationSelect, setEducationSelect] = useState({
    level: null,
    name: null,
    educationalInstitution: null,
    country: null,
  })
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
  const [decoration, setDecoration] = useState(null)
  const [percentSalary, setPercentSalary] = useState(``)
  const [scoreKPI, setScoreKPI] = useState(``)
  const [scoreCompetence, setScoreCompetence] = useState(``)
  const [statusDisability, setStatusDisability] = useState(``)
  const [skills, setSkills] = useState(``)
  const [percentDialog, setPercentDialog] = useState([])

  const setInputs = useCallback(
    data => {
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
      if (data.person.location !== null) {
        setLocationSelect({
          province: uniqByKeepFirst(locations, it => it.province).find(
            elem => elem.province === data.person.location.province
          ),
          district: uniqByKeepFirst(locations, it => it.district).find(
            elem =>
              elem.province === data.person.location.province &&
              elem.district === data.person.location.district
          ),
          subdistrict: locations.find(
            elem =>
              elem.province === data.person.location.province &&
              elem.district === data.person.location.district &&
              elem.subdistrict === data.person.location.subdistrict
          ),
        })
      }
      setAddress(data.person.Address)
      setEmergencyName(data.person.Emergency_Name)
      setEmergencyNumber(data.person.Emergency_Number)
      setStartDate(new Date(data.person.StartDate))
      setEducationSelect({
        level:
          data.person.education_level !== null
            ? educationLevels.find(
                elem => elem._id === data.person.education_level._id
              )
            : null,
        name:
          data.person.education_name !== null
            ? educationNames.find(
                elem => elem._id === data.person.education_name._id
              )
            : null,
        educationalInstitution:
          data.person.educational_institution !== null
            ? educationalInstitutions.find(
                elem => elem._id === data.person.educational_institution._id
              )
            : null,
        country:
          data.person.country !== null
            ? countries.find(elem => elem._id === data.person.country._id)
            : null,
      })
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
      setDecoration(
        data.person.decoration !== null
          ? decorations.find(elem => elem._id === data.person.decoration._id)
          : null
      )
      setPercentSalary(data.person.PercentSalary)
      setScoreKPI(data.person.ScoreKPI)
      setScoreCompetence(data.person.ScoreCompetence)
      setStatusDisability(data.person.StatusDisability)
      setSkills(data.person.skills)
    },
    [
      locations,
      countries,
      educationLevels,
      educationNames,
      educationalInstitutions,
      decorations,
    ]
  )

  const getPositionsForAdding = useCallback(async () => {
    let role = ``
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 1,
        open: true,
        title: `กำลังโหลดข้อมูลคลังตำแหน่งที่ว่างทั้งหมด`,
        percent: 0,
      },
    ])

    if (roleLevel(userInfo.role) <= 1) {
      role = `division: "${userInfo.division._id}"`
    }

    if (roleLevel(userInfo.role) >= 2) {
      switch (divisionId) {
        case undefined:
        case null:
        case ``:
          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `ยังไม่ได้เลือกสังกัด`,
              description: `กรุณาเลือกสังกัดก่อนการเพื่อข้อมูลประวัติกำลังพล`,
              variant: `error`,
              confirmText: `ตกลง`,
              callback: () => navigate(`/people/`),
            },
          })
          setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))

          return 0

        default:
          role = `division: "${divisionId}"`
          break
      }
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
      // console.log({
      //   function: `getPositionsForAdding()`,
      //   message: error.message,
      // })

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPositionsForAdding(),
          },
        })
      } else {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `ไม่พบสังกัดที่ท่านเลือกในฐานข้อมูล`,
            description: `กรุณาลองใหม่อีกครั้ง`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => navigate(`/people/`),
          },
        })
        setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))
      }

      return 0
    }

    setFirstStrike(true)

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

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 1, {
            percent: (i * 100) / lap,
          })
        )

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

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 1, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))
    }, 200)

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      })
    }, 200)
  }, [token, userInfo, divisionId, dispatch])

  const getPersonForEditing = useCallback(async () => {
    let returnData = {
      person: null,
      position: null,
    }

    if (id === null) {
      setIsError({
        status: `notfound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
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
              PercentSalary
              ScoreKPI
              ScoreCompetence
              StatusDisability
              skills
              staff_created
              staff_updated
              createdAt
              updatedAt
              type
              location {
                _id
                province
                district
                subdistrict
                zipcode
              }
              education_level {
                _id
                code
                name
              }
              education_name {
                _id
                code
                short_name
                full_name
              }
              educational_institution {
                _id
                code
                name
              }
              country {
                _id
                code
                name
              }
              decoration {
                _id
                short_name
                full_name
                eng_name
              }
            }
          }
        `,
      })

      if (res.data.person !== null) {
        returnData.person = res.data.person

        setAgents({
          whoCreated: {
            id: res.data.person.staff_created,
            date: new Date(res.data.person.createdAt),
          },
          whoUpdated: {
            id: res.data.person.staff_updated,
            date: new Date(res.data.person.updatedAt),
          },
        })
      } else {
        setIsError({
          status: `notfound`,
          text: `ไม่พบข้อมูลหน้านี้`,
        })
      }
    } catch (error) {
      // console.log({
      //   function: `getPersonForEditing()`,
      //   message: error.message,
      // })

      setIsError({
        status: `notfound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropDialog: {
          open: false,
          title: ``,
        },
      })

      return 0
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
        status: `notfound`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })
    }

    // console.log(returnData)
    if (returnData.person !== null && returnData.position !== null) {
      setInputs(returnData)
      setFirstStrike(true)
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, id, setInputs, dispatch])

  const getPositionsForEditing = useCallback(async () => {
    let role = ``
    let lap = 0

    setPercentDialog(prev => [
      ...prev,
      {
        id: 1,
        open: true,
        title: `กำลังโหลดข้อมูลคลังตำแหน่งที่ว่างทั้งหมด`,
        percent: 0,
      },
    ])

    if (id === null) {
      return 0
    }

    if (roleLevel(userInfo.role) <= 1) {
      role = `division: "${userInfo.division._id}"`
    }

    if (roleLevel(userInfo.role) >= 2) {
      try {
        const res = await client(token).query({
          query: gql`
            query Positions {
              positions(where: {
                person: "${id}"
              }) {
                _id
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

        if (res.data.positions.length > 0) {
          const divisionId = res.data.positions[0].division._id
          role = `division: "${divisionId}"`
        }
      } catch (error) {
        // console.log({
        //   function: `getPositionsForEditing()`,
        //   message: error.message,
        // })

        if (error.message === `Failed to fetch`) {
          setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))
          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `การเชื่อมต่อไม่เสถียร`,
              description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
              variant: `error`,
              confirmText: `ลองอีกครั้ง`,
              callback: () => getPositionsForEditing(),
            },
          })
        }

        return 0
      }
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
            callback: () => getPositionsForEditing(),
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

        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 1, {
            percent: (i * 100) / lap,
          })
        )

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

    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 1, {
        percent: 100,
      })
    )
    setTimeout(() => {
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))
    }, 200)

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      })
    }, 200)
  }, [token, userInfo, id, dispatch])

  const goAdd = async () => {
    let getPersonID = ``

    setIsError({
      status: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
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
                PercentSalary: "${percentSalary}",
                ScoreKPI: "${scoreKPI}",
                ScoreCompetence: "${scoreCompetence}",
                StatusDisability: "${statusDisability}",
                skills: "${skills}",
                staff_created: "${userInfo._id}",
                staff_updated: "${userInfo._id}",
                type: "${jobType}",
                isResigned: false,
                resignationNote: "",
                position: null,
                location: ${renderValueForRelationField(
                  locationSelect.subdistrict
                )},
                education_level: ${renderValueForRelationField(
                  educationSelect.level
                )},
                education_name: ${renderValueForRelationField(
                  educationSelect.name
                )},
                educational_institution: ${renderValueForRelationField(
                  educationSelect.educationalInstitution
                )},
                country: ${renderValueForRelationField(
                  educationSelect.country
                )},
                decoration: ${renderValueForRelationField(decoration)},
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
                  description: "people->create => ${getPersonID}",
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
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }

  const goEdit = async () => {
    let getPersonID = ``

    setIsError({
      status: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
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
                PercentSalary: "${percentSalary}",
                ScoreKPI: "${scoreKPI}",
                ScoreCompetence: "${scoreCompetence}",
                StatusDisability: "${statusDisability}",
                skills: "${skills}",
                staff_updated: "${userInfo._id}",
                type: "${jobType}",
                location: ${renderValueForRelationField(
                  locationSelect.subdistrict
                )},
                education_level: ${renderValueForRelationField(
                  educationSelect.level
                )},
                education_name: ${renderValueForRelationField(
                  educationSelect.name
                )},
                educational_institution: ${renderValueForRelationField(
                  educationSelect.educationalInstitution
                )},
                country: ${renderValueForRelationField(
                  educationSelect.country
                )},
                decoration: ${renderValueForRelationField(decoration)},
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
              navigate(`/people/list/`)
            },
          },
        })

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "people->save => ${id}",
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
      backdropDialog: {
        open: false,
        title: ``,
      },
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
    setEducationSelect({
      level: null,
      name: null,
      educationalInstitution: null,
      country: null,
    })
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
    setDecoration(null)
    setPercentSalary(``)
    setScoreKPI(``)
    setScoreCompetence(``)
    setStatusDisability(``)
    setSkills(``)
  }

  const reloadInput = () => {
    getPersonForEditing()
  }

  const renderFilterPositions = positionsArr => {
    let returnPositions = positionsArr

    if (positionTypeSelect !== ``) {
      returnPositions = positionsArr.filter(
        elem => elem.position_type.type === positionTypeSelect
      )
    }

    if (positionNameSelect !== ``) {
      returnPositions = positionsArr.filter(
        elem =>
          elem.position_type.type === positionTypeSelect &&
          elem.position_type.name === positionNameSelect
      )
    }

    return returnPositions
  }

  useEffect(() => {
    if (token !== ``) {
      if (!modification) {
        getPositionsForAdding()
      }
    }
  }, [token, modification, getPositionsForAdding])

  useEffect(() => {
    const fetchDataForEditing = async () => {
      await getPersonForEditing()
      await getPositionsForEditing()
    }

    if (token !== ``) {
      if (modification) {
        fetchDataForEditing()
      }
    }
  }, [token, modification, getPersonForEditing, getPositionsForEditing])

  useEffect(() => {
    if (jobType === `ลูกจ้างประจำ`) {
      setMovementType(``)
      setOutline(``)
      setRewardType3(``)
      setContactCnt(``)
      setCurrentContactStart(null)
      setCurrentContactEnd(null)
    } else {
      setDecoration(null)
    }
  }, [jobType])

  return (
    <>
      {(modification && firstStrike) || (!modification && firstStrike) ? (
        <>
          <Form
            onSubmit={e => {
              e.preventDefault()

              !modification ? goAdd() : goEdit()
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
                          : `กำลังโหลดข้อมูล...`
                        : `ไม่พบข้อมูล`
                    }
                    getOptionLabel={option => {
                      let returnLabel = option.number

                      if (roleLevel(userInfo.role) > 1) {
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item sm={11} xs={10}>
                <DayPicker
                  selected={birthDate}
                  onChange={newValue => {
                    setBirthDate(newValue)
                  }}
                  pickerProps={{
                    toYear: new Date().getFullYear(),
                  }}
                  inputProps={{
                    sx: textfieldProps,
                    id: "BirthDate",
                    label: "* วันเดือนปีเกิด",
                    InputProps: {
                      ...dayPickerInputProps,
                      endAdornment: renderCheckingIcon(
                        birthDate === null ? `` : birthDate
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid item sm={1} xs={2}>
                <TextFieldWall
                  style={{
                    width: `100%`,
                    height: `100%`,
                    whiteSpace: `nowrap`,
                    backgroundColor: `rgba(0, 0, 0, 0.15)`,
                  }}
                >
                  {birthDate !== null
                    ? `${renderAgeFromDifferentDateRange(birthDate)} ปี`
                    : ``}
                </TextFieldWall>
              </Grid>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
            <Divider
              style={{
                margin: `2rem auto`,
                width: 360,
                maxWidth: `100%`,
              }}
            />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="Province"
                    disablePortal
                    options={uniqByKeepFirst(locations, it => it.province)}
                    noOptionsText={`ไม่พบข้อมูล`}
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
                              locations,
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
                          ? locations.filter(
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
                    label="รหัสไปรษณีย์"
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
            <Divider
              style={{
                margin: `2rem auto`,
                width: 360,
                maxWidth: `100%`,
              }}
            />
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
            <Divider
              style={{
                margin: `2rem auto`,
                width: 360,
                maxWidth: `100%`,
              }}
            />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <DayPicker
                  selected={startDate}
                  onChange={newValue => {
                    setStartDate(newValue)
                  }}
                  inputProps={{
                    sx: textfieldProps,
                    id: "StartDate",
                    label: "* วันเริ่มทำสัญญา",
                    InputProps: {
                      ...dayPickerInputProps,
                      endAdornment: renderCheckingIcon(
                        startDate === null ? `` : startDate
                      ),
                    },
                  }}
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
                    options={educationLevels}
                    noOptionsText={`ไม่พบข้อมูล`}
                    getOptionLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEducationSelect(prev => ({
                        ...prev,
                        level: newValue,
                      }))
                    }}
                    value={educationSelect.level}
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
                    {renderCheckingIcon(educationSelect.level)}
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
                    getOptionLabel={option => `${option.full_name}`}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEducationSelect(prev => ({
                        ...prev,
                        name: newValue,
                      }))
                    }}
                    value={educationSelect.name}
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
                    {renderCheckingIcon(educationSelect.name)}
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
                    getOptionLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEducationSelect(prev => ({
                        ...prev,
                        educationalInstitution: newValue,
                      }))
                    }}
                    value={educationSelect.educationalInstitution}
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
                    {renderCheckingIcon(educationSelect.educationalInstitution)}
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
                    getOptionLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => {
                      return option === value
                    }}
                    onChange={(_, newValue) => {
                      setEducationSelect(prev => ({
                        ...prev,
                        country: newValue,
                      }))
                    }}
                    value={educationSelect.country}
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
                    {renderCheckingIcon(educationSelect.country)}
                  </CheckCircleFlex>
                </Flex>
              </Grid>
            </Grid>
            <Divider
              style={{
                margin: `2rem auto`,
                width: 360,
                maxWidth: `100%`,
              }}
            />
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
                  <DayPicker
                    selected={currentContactStart}
                    onChange={newValue => {
                      setCurrentContactStart(newValue)
                    }}
                    inputProps={{
                      sx: textfieldProps,
                      id: "CurrentContactStart",
                      label: "* วันที่เริ่มสัญญาปัจจุบัน",
                      InputProps: {
                        ...dayPickerInputProps,
                        endAdornment: renderCheckingIcon(currentContactStart),
                      },
                    }}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  />
                </DisabledBlock>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DisabledBlock
                  className={jobType === `ลูกจ้างประจำ` ? `disabled` : ``}
                >
                  <DayPicker
                    selected={currentContactEnd}
                    onChange={newValue => {
                      setCurrentContactEnd(newValue)
                    }}
                    inputProps={{
                      sx: textfieldProps,
                      id: "CurrentContactEnd",
                      label: "* วันที่สิ้นสุดสัญญาปัจจุบัน",
                      InputProps: {
                        ...dayPickerInputProps,
                        endAdornment: renderCheckingIcon(currentContactEnd),
                      },
                    }}
                    disabled={jobType === `ลูกจ้างประจำ`}
                  />
                </DisabledBlock>
              </Grid>
            </Grid>
            <Divider
              style={{
                margin: `2rem auto`,
                width: 360,
                maxWidth: `100%`,
              }}
            />
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
                  <Flex>
                    <Autocomplete
                      sx={{ width: `100%` }}
                      id="Decoration"
                      disablePortal
                      options={decorations}
                      noOptionsText={`ไม่พบข้อมูล`}
                      getOptionLabel={option => `${option.full_name}`}
                      isOptionEqualToValue={(option, value) => {
                        return option === value
                      }}
                      onChange={(_, newValue) => {
                        setDecoration(newValue)
                      }}
                      value={decoration}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: `5px`,
                            },
                          }}
                        />
                      )}
                      disabled={jobType !== `ลูกจ้างประจำ`}
                    />
                  </Flex>
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

            <Grid container spacing={2}>
              <Grid item md={6} sm={12} xs={12} />
              <Grid item md={3} sm={12} xs={12}>
                {!modification ? (
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
                          educationSelect.level === null ||
                          educationSelect.name === null ||
                          educationSelect.educationalInstitution === null ||
                          educationSelect.country === null ||
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
                          educationSelect.level === null ||
                          educationSelect.name === null ||
                          educationSelect.educationalInstitution === null ||
                          educationSelect.country === null ||
                          rewardType1 === `` ||
                          mission === ``
                    }
                  >
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
                    เพิ่มรายการ
                  </Button>
                ) : (
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
                          educationSelect.level === null ||
                          educationSelect.name === null ||
                          educationSelect.educationalInstitution === null ||
                          educationSelect.country === null ||
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
                          educationSelect.level === null ||
                          educationSelect.name === null ||
                          educationSelect.educationalInstitution === null ||
                          educationSelect.country === null ||
                          rewardType1 === `` ||
                          mission === ``
                    }
                  >
                    <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
                    บันทึก
                  </Button>
                )}
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                {!modification ? (
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
                      educationSelect.level === null &&
                      educationSelect.name === null &&
                      educationSelect.educationalInstitution === null &&
                      educationSelect.country === null &&
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
                      decoration === null &&
                      percentSalary === `` &&
                      scoreKPI === `` &&
                      scoreCompetence === `` &&
                      statusDisability === `` &&
                      skills === ``
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ marginRight: 5 }}
                    />
                    ล้าง
                  </Button>
                ) : (
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
                )}
              </Grid>
            </Grid>
          </Form>
          <PercentDialog data={percentDialog} />

          {modification && roleLevel(userInfo.role) >= 2 && (
            <>
              <Divider style={{ margin: `2rem auto`, width: `100%` }} />
              <WhoCreated
                whoCreated={agents.whoCreated}
                whoUpdated={agents.whoUpdated}
              />
            </>
          )}
          {modification && roleLevel(userInfo.role) >= 2 && (
            <>
              <Divider style={{ marginTop: `2rem`, marginBottom: `1rem` }} />
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
                  <FontAwesomeIcon icon={faTrash} style={{ marginRight: 5 }} />
                  ลบ
                </Button>
              </Flex>
            </>
          )}
        </>
      ) : (
        <>
          {isError.status === `notfound` && (
            <Warning
              text="ไม่พบ url ที่ท่านเรียกหรือเนื้อหาในส่วนนี้ได้ถูกลบออกจากระบบ"
              variant="notfound"
              button={
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(`/people/list/`)}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    style={{ marginRight: 5 }}
                  />
                  <span>กลับไปหน้าค้นหากำลังพล</span>
                </Button>
              }
            />
          )}
        </>
      )}
    </>
  )
}

PersonForm.propTypes = {
  modification: PropTypes.bool,
  id: PropTypes.string,
  divisionId: PropTypes.string,
}

PersonForm.defaultProps = {
  modification: false,
}

export default PersonForm
