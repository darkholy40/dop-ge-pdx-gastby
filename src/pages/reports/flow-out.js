import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  TextField,
  Alert,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import ExportToExcel from "../../components/export-to-excel"
import { Form, Flex } from "../../components/styles"
import renderDivision from "../../functions/render-division"
import renderNumberAsText from "../../functions/render-number-as-text"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const FlowOutPage = () => {
  const { token, userInfo, units } = useSelector(state => state)
  const dispatch = useDispatch()

  const [input, setInput] = useState({
    unit: null,
  })
  const [data, setData] = useState([])
  const [statusCode, setStatusCode] = useState(`loading`)
  const [percent, setPercent] = useState(0)

  const getData = useCallback(async () => {
    setStatusCode(`loading`)
    setPercent(0)

    let lap = 0

    const condition =
      input.unit !== null
        ? `where: {
          position: {
            division: "${input.unit._id}"
          }
        }`
        : `where: {
          position_null: false
        }`

    try {
      const res = await client(token).query({
        query: gql`
          query PeopleCount {
            peopleConnection(${condition}) {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.peopleConnection.aggregate.count
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      console.log(error.message)

      if (error.message === `Failed to fetch`) {
        setStatusCode(`connection`)
        getData()
        return 0
      }
    }

    if (lap > 0) {
      let returnData = []

      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query People {
              people(${condition}, limit: 100, start: ${i * 100}) {
                _id
                Prename
                Name
                Surname
                ID_Card
                Gender
                BirthDate
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
                isResigned
                resignationNote
                position {
                  _id
                  number
                  position_type {
                    type
                    name
                    order
                  }
                  isOpen
                  isSouth
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

        for (let person of res.data.people) {
          returnData = [...returnData, person]
        }

        setPercent((i * 100) / lap)
      }

      if (returnData.length > 0) {
        let modifiedReturnData = []

        for (let person of returnData) {
          modifiedReturnData = [
            ...modifiedReturnData,
            {
              ชื่อกระทรวง: "กระทรวงกลาโหม",
              ชื่อกรม:
                person.position !== null
                  ? person.position.division.division1
                  : ``,
              "ชื่อสำนัก/กอง":
                person.position !== null
                  ? renderDivision(person.position.division)
                  : ``,
              เลขที่ตำแหน่ง:
                person.position !== null ? person.position.number : ``,
              ชื่อตำแหน่งในสายงาน:
                person.position !== null
                  ? person.position.position_type.name
                  : ``,
              ชื่อประเภทกลุ่มงาน:
                person.position !== null
                  ? person.position.position_type.type
                  : ``,
              "สังกัดราชการส่วนกลาง/ส่วนภูมิภาค": "xxx",
              ชื่อจังหวัด: "xxx",
              "ชื่อคำนำหน้าชื่อ ": person !== null ? person.Prename : ``,
              ชื่อผู้ครองตำแหน่ง: person !== null ? person.Name : ``,
              นามสกุลผู้ครองตำแหน่ง: person !== null ? person.Surname : ``,
              เลขประจำตัวประชาชน: person !== null ? person.ID_Card : ``,
              เพศ: person !== null ? person.Gender : ``,
              จำนวนครั้งที่ทำสัญญา:
                person !== null ? renderNumberAsText(person.ContactCnt) : ``,
              ประเภทภารกิจ: person !== null ? person.Mission : ``,
              สาเหตุการออก: person !== null ? person.resignationNote : ``,
            },
          ]
        }

        setData(modifiedReturnData)
      }

      setStatusCode(``)
    } else {
      setStatusCode(`0`)
    }

    setPercent(100)
    setTimeout(() => {
      setPercent(0)
    }, 300)
  }, [token, input.unit])

  const displayStatus = code => {
    switch (code) {
      case ``:
        return `การเตรียมข้อมูลนำออกสำเร็จ`

      case `0`:
        return `ไม่มีข้อมูลสำหรับนำออก`

      case `connection`:
        return `การเชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อของอุปกรณ์`

      case `loading`:
        return `กำลังโหลดข้อมูล...`

      default:
        return ``
    }
  }

  const printSeverity = value => {
    switch (value) {
      case ``:
        return `success`

      case `loading`:
        return `info`

      default:
        return `warning`
    }
  }

  useEffect(() => {
    getData()
  }, [getData, input.unit])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `reports`,
    })
  }, [dispatch])

  useEffect(() => {
    if (token !== `` && userInfo._id !== ``) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "reports -> flow-out",
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

  return (
    <Layout>
      {token !== `` && userInfo.role.name === `Administrator` ? (
        <>
          <Seo title="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา" />
          <Breadcrumbs
            previous={[
              {
                name: `ออกรายงาน`,
                link: `/reports`,
              },
            ]}
            current="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)"
          />

          <Container>
            <Form onSubmit={e => e.preventDefault()} style={{ width: `400px` }}>
              <p>
                ข้อมูลนำออก:{" "}
                {input.unit !== null ? renderDivision(input.unit) : `ทั้งหมด`}
              </p>
              <Flex style={{ marginBottom: `1rem` }}>
                <Autocomplete
                  sx={{ width: `100%` }}
                  id="position-name"
                  disablePortal
                  options={units}
                  noOptionsText={`ไม่พบข้อมูล`}
                  getOptionLabel={option => renderDivision(option)}
                  isOptionEqualToValue={(option, value) => {
                    return option === value
                  }}
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setInput(prev => ({
                        ...prev,
                        unit: newValue,
                      }))
                    } else {
                      setInput(prev => ({
                        ...prev,
                        unit: null,
                      }))
                    }
                  }}
                  value={input.unit}
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
              <Alert
                sx={{ marginBottom: `1rem`, animation: `fadein 0.3s` }}
                severity={printSeverity(statusCode)}
              >
                {displayStatus(statusCode)}
              </Alert>
              <Box
                sx={{
                  display: `flex`,
                  alignItems: `center`,
                  marginBottom: `1rem`,
                  opacity: statusCode === `loading` ? 1 : 0,
                  transition: `opacity 0.3s`,
                }}
              >
                <Box sx={{ width: `100%`, mr: 1 }}>
                  <LinearProgress
                    sx={{
                      height: `8px`,
                      borderRadius: `8px`,
                      ".MuiLinearProgress-bar": { borderRadius: `8px` },
                    }}
                    variant="determinate"
                    value={percent}
                  />
                </Box>
                <Box sx={{ minWidth: 50 }}>
                  <Typography
                    sx={{ transform: `skewX(-10deg)` }}
                    variant="body2"
                    color="text.secondary"
                  >{`${percent.toFixed(2)}%`}</Typography>
                </Box>
              </Box>
              <ExportToExcel
                apiData={data}
                fileName="flow-out"
                sheetName="FLOW-OUT"
                disabled={statusCode !== ``}
                callback={() =>
                  client(token).mutate({
                    mutation: gql`
                      mutation CreateLog {
                        createLog(input: {
                          data: {
                            action: "action",
                            description: "download -> flowout -> ${
                              input.unit !== null
                                ? renderDivision(input.unit)
                                : `ทั้งหมด`
                            }",
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
              />
            </Form>
          </Container>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default FlowOutPage
