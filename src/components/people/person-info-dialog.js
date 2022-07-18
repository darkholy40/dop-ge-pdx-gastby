import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  LinearProgress,
  Tooltip,
  Collapse,
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTimes,
  faPencilAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import WhoCreated from "../who-created"
import { Flex, TextFieldDummyOutlined } from "../styles"
import renderDivision from "../../functions/render-division"
import renderTableDate from "../../functions/render-table-date"
import renderAgeFromDifferentDateRange from "../../functions/render-age-from-different-date-range"
import renderFullname from "../../functions/render-fullname"
import renderNumberAsText from "../../functions/render-number-as-text"
import roleLevel from "../../functions/role-level"

const Content = styled(Flex)`
  flex-direction: column;
`

const PersonInfoDialog = ({ personId, open, title, callback, viewOnly }) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const [data, setData] = useState(null)
  const [progressStatus, setProgressStatus] = useState({
    status: ``,
    text: ``,
  })
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

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (
      token !== `` &&
      userInfo._id !== `` &&
      personId !== `` &&
      roleLevel(userInfo.role) < 3
    ) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "people->view => ${personId}",
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
  }, [token, userInfo, personId])

  const getPerson = useCallback(async () => {
    let returnData = {
      person: null,
      position: null,
    }

    setProgressStatus({
      status: `loading`,
      text: `กำลังโหลดข้อมูล`,
    })

    if (personId === `0`) {
      setProgressStatus({
        type: `not-found`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    try {
      const res = await client(token).query({
        query: gql`
          query Person {
            person(id: "${personId}") {
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
        setProgressStatus({
          type: `not-found`,
          text: `ไม่พบข้อมูลหน้านี้`,
        })
      }
    } catch (error) {
      console.log(error)

      setProgressStatus({
        type: `connection`,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได`,
      })
    }

    try {
      const res = await client(token).query({
        query: gql`
          query Position {
            positions(where: {
              person: "${personId}"
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

      setProgressStatus({
        type: `connection`,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได`,
      })
    }

    if (returnData.person !== null && returnData.position !== null) {
      setData(returnData)
      setProgressStatus({
        status: ``,
        text: ``,
      })
    } else {
      setProgressStatus({
        status: `error`,
        text: `ข้อมูลผิดพลาดผิดพลาด`,
      })
    }
  }, [token, personId])

  const getResignedPerson = useCallback(async () => {
    let returnData = {
      person: null,
      position: null,
    }

    setProgressStatus({
      status: `loading`,
      text: `กำลังโหลดข้อมูล`,
    })

    if (personId === `0`) {
      setProgressStatus({
        type: `not-found`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    try {
      const res = await client(token).query({
        query: gql`
          query Person {
            person(id: "${personId}") {
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
              position {
                _id
                position_type {
                  type
                  name
                }
                number
                division {
                  _id
                  division1
                  division2
                  division3
                } 
              }
            }
          }
        `,
      })

      const thisPerson = res.data.person

      if (thisPerson !== null) {
        returnData.person = {
          _id: thisPerson._id,
          Prename: thisPerson.Prename,
          Name: thisPerson.Name,
          Surname: thisPerson.Surname,
          ID_Card: thisPerson.ID_Card,
          SID_Card: thisPerson.SID_Card,
          Gender: thisPerson.Gender,
          BirthDate: thisPerson.BirthDate,
          MarriedStatus: thisPerson.MarriedStatus,
          Telephone: thisPerson.Telephone,
          Address: thisPerson.Address,
          Emergency_Name: thisPerson.Emergency_Name,
          Emergency_Number: thisPerson.Emergency_Number,
          StartDate: thisPerson.StartDate,
          MovementType: thisPerson.MovementType,
          Outline: thisPerson.Outline,
          RewardType1: thisPerson.RewardType1,
          RewardType2: thisPerson.RewardType2,
          RewardType3: thisPerson.RewardType3,
          ContactCnt: thisPerson.ContactCnt,
          Mission: thisPerson.Mission,
          CurrentContactStart: thisPerson.CurrentContactStart,
          CurrentContactEnd: thisPerson.CurrentContactEnd,
          Guilty: thisPerson.Guilty,
          Punish: thisPerson.Punish,
          PercentSalary: thisPerson.PercentSalary,
          ScoreKPI: thisPerson.ScoreKPI,
          ScoreCompetence: thisPerson.ScoreCompetence,
          StatusDisability: thisPerson.StatusDisability,
          skills: thisPerson.skills,
          staff_created: thisPerson.staff_created,
          staff_updated: thisPerson.staff_updated,
          createdAt: thisPerson.createdAt,
          updatedAt: thisPerson.updatedAt,
          type: thisPerson.type,
          location: thisPerson.location,
          education_level: thisPerson.education_level,
          education_name: thisPerson.education_name,
          educational_institution: thisPerson.educational_institution,
          country: thisPerson.country,
          decoration: thisPerson.decoration,
        }

        returnData.position = {
          _id: thisPerson.position._id,
          position_type: thisPerson.position.position_type,
          number: thisPerson.position.number,
          division: thisPerson.position.division,
        }

        setAgents({
          whoCreated: {
            id: thisPerson.staff_created,
            date: new Date(thisPerson.createdAt),
          },
          whoUpdated: {
            id: thisPerson.staff_updated,
            date: new Date(thisPerson.updatedAt),
          },
        })
      } else {
        setProgressStatus({
          type: `not-found`,
          text: `ไม่พบข้อมูลหน้านี้`,
        })
      }
    } catch (error) {
      console.log(error)

      setProgressStatus({
        type: `connection`,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได`,
      })
    }

    if (returnData.person !== null && returnData.position !== null) {
      setData(returnData)
      setProgressStatus({
        status: ``,
        text: ``,
      })
    } else {
      setProgressStatus({
        status: `error`,
        text: `ข้อมูลผิดพลาดผิดพลาด`,
      })
    }
  }, [token, personId])

  const closeModal = () => {
    callback()

    setTimeout(() => {
      setData(null)
    }, 200)
  }

  useEffect(() => {
    const checkPersonIsResigned = async () => {
      let isResigned = false

      try {
        const res = await client(token).query({
          query: gql`
            query PersonIsResigned {
              person(id: "${personId}") {
                _id
                isResigned
              }
            }
          `,
        })

        if (res) {
          isResigned = res.data.person.isResigned || false

          !isResigned ? getPerson() : getResignedPerson()
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (open) {
      checkPersonIsResigned()
    }
  }, [token, personId, open, getPerson, getResignedPerson])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="lg"
        scroll="paper"
        open={open}
        onClose={() => closeModal()}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers sx={{ padding: `24px` }}>
          <Collapse
            in={data !== null && progressStatus.status === ``}
            easing={{
              enter: `ease-in`,
            }}
          >
            <Content>
              {data !== null && progressStatus.status === `` && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อ
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {renderFullname({
                            rank: data.person.Prename,
                            name: data.person.Name,
                            surname: data.person.Surname,
                          })}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          หมายเลขประจำตัวประชาชน
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.ID_Card || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          หมายเลขประจำตัวข้าราชการกองทัพบก
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.SID_Card || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ประเภท
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.type || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อตำแหน่งในสายงาน
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.position.position_type !== null
                            ? data.position.position_type.name
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อประเภทกลุ่มงาน
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.position.position_type !== null
                            ? data.position.position_type.type
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          เลขที่ตำแหน่ง
                        </TextFieldDummyOutlined.Label>
                        <span>{data.position.number || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สังกัด
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {renderDivision(data.position.division) || `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          วันเดือนปีเกิด
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.BirthDate !== null
                            ? `${renderTableDate(
                                data.person.BirthDate,
                                `full-date`
                              )} (${renderAgeFromDifferentDateRange(
                                data.person.BirthDate
                              )} ปี)`
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          เพศ
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.Gender || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สถานภาพสมรส
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.MarriedStatus || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          หมายเลขโทรศัพท์
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.Telephone || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  <Divider
                    style={{
                      margin: `2rem auto`,
                      width: 360,
                      maxWidth: `100%`,
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          จังหวัด
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.location !== null
                            ? data.person.location.province
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          อำเภอ
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.location !== null
                            ? data.person.location.district
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ตำบล
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.location !== null
                            ? data.person.location.subdistrict
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          รหัสไปรษณีย์
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.location !== null
                            ? data.person.location.zipcode
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          รายละเอียดที่อยู่
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.Address || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  <Divider
                    style={{
                      margin: `2rem auto`,
                      width: 360,
                      maxWidth: `100%`,
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          วันเริ่มทำสัญญา
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {renderTableDate(
                            data.person.StartDate,
                            `full-date`
                          ) || `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ระดับการศึกษา
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.education_level !== null
                            ? data.person.education_level.name
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อวุฒิการศึกษา
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.education_name !== null
                            ? data.person.education_name.full_name
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อสถาบันที่สำเร็จการศึกษา
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.educational_institution !== null
                            ? data.person.educational_institution.name
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ชื่อประเทศ
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.country !== null
                            ? data.person.country.name
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  <Divider
                    style={{
                      margin: `2rem auto`,
                      width: 360,
                      maxWidth: `100%`,
                    }}
                  />
                  <Grid container spacing={2}>
                    {data.person.type === `พนักงานราชการ` && (
                      <>
                        <Grid item sm={6} xs={12}>
                          <TextFieldDummyOutlined.Line>
                            <TextFieldDummyOutlined.Label>
                              ชื่อประเภทการเคลื่อนไหวล่าสุด
                            </TextFieldDummyOutlined.Label>
                            <span>{data.person.MovementType || `-`}</span>
                          </TextFieldDummyOutlined.Line>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                          <TextFieldDummyOutlined.Line>
                            <TextFieldDummyOutlined.Label>
                              กรอบอัตรากำลัง
                            </TextFieldDummyOutlined.Label>
                            <span>{data.person.Outline || `-`}</span>
                          </TextFieldDummyOutlined.Line>
                        </Grid>
                      </>
                    )}
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ค่าตอบแทนปัจจุบัน(เงินเดือน)
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.RewardType1 || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ค่าตอบแทนสำหรับตำแหน่งที่มีเหตุพิเศษ
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.RewardType2 || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    {data.person.type === `พนักงานราชการ` && (
                      <Grid item sm={4} xs={12}>
                        <TextFieldDummyOutlined.Line>
                          <TextFieldDummyOutlined.Label>
                            ค่าครองชีพชั่วคราว
                          </TextFieldDummyOutlined.Label>
                          <span>{data.person.RewardType3 || `-`}</span>
                        </TextFieldDummyOutlined.Line>
                      </Grid>
                    )}
                    {data.person.type === `พนักงานราชการ` && (
                      <Grid item sm={3} xs={12}>
                        <TextFieldDummyOutlined.Line>
                          <TextFieldDummyOutlined.Label>
                            จำนวนครั้งที่ทำสัญญา
                          </TextFieldDummyOutlined.Label>
                          <span>{data.person.ContactCnt || `-`}</span>
                        </TextFieldDummyOutlined.Line>
                      </Grid>
                    )}
                    <Grid
                      item
                      sm={data.person.type === `พนักงานราชการ` ? 3 : 4}
                      xs={12}
                    >
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ประเภทภารกิจ
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.Mission || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    {data.person.type === `พนักงานราชการ` && (
                      <>
                        <Grid item sm={3} xs={12}>
                          <TextFieldDummyOutlined.Line>
                            <TextFieldDummyOutlined.Label>
                              วันที่เริ่มสัญญาปัจจุบัน
                            </TextFieldDummyOutlined.Label>
                            <span>
                              {renderTableDate(
                                data.person.CurrentContactStart,
                                `full-date`
                              ) || `-`}
                            </span>
                          </TextFieldDummyOutlined.Line>
                        </Grid>
                        <Grid item sm={3} xs={12}>
                          <TextFieldDummyOutlined.Line>
                            <TextFieldDummyOutlined.Label>
                              วันที่สิ้นสุดสัญญาปัจจุบัน
                            </TextFieldDummyOutlined.Label>
                            <span>
                              {renderTableDate(
                                data.person.CurrentContactEnd,
                                `full-date`
                              ) || `-`}
                            </span>
                          </TextFieldDummyOutlined.Line>
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <Divider
                    style={{
                      margin: `2rem auto`,
                      width: 360,
                      maxWidth: `100%`,
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ความผิดทางวินัย
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.Guilty || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ประเภทโทษทางวินัย
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.Punish || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    {data.person.type === `ลูกจ้างประจำ` && (
                      <Grid item xs={12}>
                        <TextFieldDummyOutlined.Line>
                          <TextFieldDummyOutlined.Label>
                            เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ
                          </TextFieldDummyOutlined.Label>
                          <span>
                            {data.person.decoration !== null
                              ? data.person.decoration.full_name
                              : `-`}
                          </span>
                        </TextFieldDummyOutlined.Line>
                      </Grid>
                    )}
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ร้อยละที่ได้รับการเลื่อนเงินเดือน
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.PercentSalary
                            ? renderNumberAsText(data.person.PercentSalary, 2)
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          คะแนนผลสัมฤทธิ์ของงาน
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.ScoreKPI
                            ? renderNumberAsText(data.person.ScoreKPI, 2)
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          คะแนนประเมินสมรรถนะ
                        </TextFieldDummyOutlined.Label>
                        <span>
                          {data.person.ScoreCompetence
                            ? renderNumberAsText(data.person.ScoreCompetence, 2)
                            : `-`}
                        </span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          สภานภาพทางกาย
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.StatusDisability || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                    <Grid item xs={12}>
                      <TextFieldDummyOutlined.Line>
                        <TextFieldDummyOutlined.Label>
                          ทักษะประสบการณ์
                        </TextFieldDummyOutlined.Label>
                        <span>{data.person.skills || `-`}</span>
                      </TextFieldDummyOutlined.Line>
                    </Grid>
                  </Grid>
                  {roleLevel(userInfo.role) >= 2 && (
                    <>
                      <Divider style={{ margin: `2rem auto`, width: `100%` }} />
                      <WhoCreated
                        whoCreated={agents.whoCreated}
                        whoUpdated={agents.whoUpdated}
                      />
                    </>
                  )}
                </>
              )}
            </Content>
          </Collapse>
          {progressStatus.status === `loading` && (
            <Content>
              <div
                style={{
                  width: `100%`,
                  display: `flex`,
                  alignItems: `center`,
                  justifyContent: `center`,
                  flexDirection: `column`,
                  padding: `2rem`,
                }}
              >
                <LinearProgress
                  color="primary"
                  sx={{
                    width: `100%`,
                    maxWidth: `360px`,
                    height: `12px`,
                    borderRadius: `8px`,
                    ".MuiLinearProgress-bar": { borderRadius: `8px` },
                  }}
                />
              </div>
            </Content>
          )}
        </DialogContent>
        <DialogActions sx={{ position: `absolute`, top: 0, right: 0 }}>
          <Tooltip arrow placement="bottom" title="ปิดหน้าต่าง">
            <IconButton
              style={{ width: 40, height: 40 }}
              onClick={() => closeModal()}
            >
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </DialogActions>
        {!viewOnly && (
          <>
            <DialogActions sx={{ position: `absolute`, top: 0, right: 45 }}>
              <Tooltip arrow placement="bottom" title="จำหน่ายสูญเสีย">
                <IconButton
                  style={{ width: 40, height: 40 }}
                  color="inherit"
                  onClick={() => {
                    navigate(`/people/resignation/?id=${personId}`)
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    style={{ fontSize: 20 }}
                  />
                </IconButton>
              </Tooltip>
            </DialogActions>
            <DialogActions sx={{ position: `absolute`, top: 0, right: 90 }}>
              <Tooltip arrow placement="bottom" title="แก้ไขประวัติกำลังพล">
                <IconButton
                  style={{ width: 40, height: 40 }}
                  color="inherit"
                  onClick={() => {
                    navigate(`/people/edit/?id=${personId}`)
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    style={{ fontSize: 20 }}
                  />
                </IconButton>
              </Tooltip>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}

PersonInfoDialog.propTypes = {
  personId: PropTypes.string,
  open: PropTypes.bool,
  title: PropTypes.string,
  callback: PropTypes.func,
  viewOnly: PropTypes.bool,
}

PersonInfoDialog.defaultProps = {
  personId: ``,
  open: false,
  title: `ข้อมูลประวัติกำลังพล`,
  callback: () => {},
  viewOnly: false,
}

export default PersonInfoDialog
