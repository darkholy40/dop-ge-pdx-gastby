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
import renderThaiDate from "../../functions/render-thai-date"
import renderNumberAsText from "../../functions/render-number-as-text"
import renderPositionStatus from "../../functions/render-position-status"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const StockPage = () => {
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
      division: "${input.unit._id}"
    }`
        : ``

    try {
      const res = await client(token).query({
        query: gql`
          query PositionsCount {
            positionsConnection${condition !== `` ? `(${condition})` : ``} {
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
      console.log(error)

      setStatusCode(`connection`)
      getData()
      return 0
    }

    if (lap > 0) {
      let returnData = []

      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Positions {
              positions(${condition}, limit: 100, start: ${i * 100}) {
                _id
                number
                person {
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
                  type
                  skills
                }
                position_type {
                  type
                  name
                  order
                }
                isOpen
                isSouth
                have_a_budget
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

        setPercent((i * 100) / lap)
      }

      if (returnData.length > 0) {
        let modifiedReturnData = []

        for (let position of returnData) {
          modifiedReturnData = [
            ...modifiedReturnData,
            {
              ชื่อกระทรวง: "กระทรวงกลาโหม",
              ชื่อกรม: position.division.division1,
              "ชื่อสำนัก/กอง": renderDivision(position.division),
              เลขที่ตำแหน่ง: position.number,
              ชื่อตำแหน่งในสายงาน: position.position_type.name,
              ชื่อประเภทกลุ่มงาน: position.position_type.type,
              "สังกัดราชการส่วนกลาง/ส่วนภูมิภาค": "xxx",
              ชื่อจังหวัด: "xxx",
              "สถานภาพของตำแหน่ง ":
                position.person !== null
                  ? renderPositionStatus(position.person.type)
                  : renderPositionStatus(`-`, position.have_a_budget),
              "ชื่อคำนำหน้าชื่อ ":
                position.person !== null ? position.person.Prename : ``,
              ชื่อผู้ครองตำแหน่ง:
                position.person !== null ? position.person.Name : ``,
              นามสกุลผู้ครองตำแหน่ง:
                position.person !== null ? position.person.Surname : ``,
              เลขประจำตัวประชาชน:
                position.person !== null ? position.person.ID_Card : ``,
              เพศ: position.person !== null ? position.person.Gender : ``,
              "วัน เดือน ปี เกิด":
                position.person !== null
                  ? renderThaiDate(position.person.BirthDate)
                  : ``,
              "วัน เดือน ปี (เริ่มสัญญาครั้งแรก)":
                position.person !== null
                  ? renderThaiDate(position.person.StartDate)
                  : ``,
              ชื่อระดับการศึกษา:
                position.person !== null ? position.person.Edu_Level : ``,
              ทักษะประสบการณ์:
                position.person !== null ? position.person.skills || `-` : ``,
              "ชื่อวุฒิการศึกษา(ในตำแหน่ง)":
                position.person !== null ? position.person.Edu_Name : ``,
              "ชื่อสถาบันการศึกษาที่สำเร็จการศึกษา(ในตำแหน่ง)":
                position.person !== null ? position.person.Edu_Graduated : ``,
              ชื่อประเทศที่สำเร็จการศึกษา:
                position.person !== null ? position.person.Edu_Country : ``,
              ชื่อประเภทการเคลื่อนไหวล่าสุด:
                position.person !== null
                  ? position.person.MovementType || `-`
                  : ``,
              กรอบอัตรากำลัง:
                position.person !== null ? position.person.Outline || `-` : ``,
              อัตรากำลังจังหวัดชายแดนภาคใต้: position.isSouth
                ? `ใช่`
                : `ไม่ใช่`,
              "ค่าตอบแทนปัจจุบัน(เงินเดือน)":
                position.person !== null
                  ? renderNumberAsText(position.person.RewardType1)
                  : ``,
              ค่าตอบแทนสำหรับตำแหน่งที่มีเหตุพิเศษ:
                position.person !== null
                  ? renderNumberAsText(position.person.RewardType2)
                  : ``,
              ค่าครองชีพชั่วคราว:
                position.person !== null
                  ? renderNumberAsText(position.person.RewardType3)
                  : ``,
              จำนวนครั้งที่ทำสัญญา:
                position.person !== null
                  ? renderNumberAsText(position.person.ContactCnt)
                  : ``,
              ประเภทภารกิจ:
                position.person !== null ? position.person.Mission : ``,
              วันที่เริ่มสัญญาปัจจุบัน:
                position.person !== null
                  ? renderThaiDate(position.person.CurrentContactStart) || `-`
                  : ``,
              วันที่สิ้นสุดสัญญาปัจจุบัน:
                position.person !== null
                  ? renderThaiDate(position.person.CurrentContactEnd) || `-`
                  : ``,
              ความผิดทางวินัย:
                position.person !== null
                  ? renderNumberAsText(position.person.Guilty)
                  : ``,
              ประเภทโทษทางวินัย:
                position.person !== null
                  ? renderNumberAsText(position.person.Punish)
                  : ``,
              เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ:
                position.person !== null
                  ? renderNumberAsText(position.person.Decoration)
                  : ``,
              ร้อยละที่ได้รับการเลื่อนเงินเดือน:
                position.person !== null
                  ? renderNumberAsText(position.person.PercentSalary, 2)
                  : ``,
              คะแนนผลสัมฤทธิ์ของงาน:
                position.person !== null
                  ? renderNumberAsText(position.person.ScoreKPI, 2)
                  : ``,
              คะแนนประเมินสมรรถนะ:
                position.person !== null
                  ? renderNumberAsText(position.person.ScoreCompetence, 2)
                  : ``,
              สภานภาพทางกาย:
                position.person !== null
                  ? position.person.StatusDisability
                  : ``,
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
                description: "reports -> stock",
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
          <Seo title="รายชื่อพนักงานราชการและตำแหน่งว่าง" />
          <Breadcrumbs
            previous={[
              {
                name: `ออกรายงาน`,
                link: `/reports`,
              },
            ]}
            current="รายชื่อพนักงานราชการและตำแหน่งว่าง (Stock)"
          />

          <Container>
            <Form onSubmit={e => e.preventDefault()} style={{ width: `100%` }}>
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
                  disabled={
                    statusCode === `loading` || statusCode === `connection`
                  }
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
                    sx={{ height: `8px`, borderRadius: `8px` }}
                    variant="determinate"
                    value={percent}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography
                    sx={{ transform: `skewX(-10deg)` }}
                    variant="body2"
                    color="text.secondary"
                  >{`${percent.toFixed(2)}%`}</Typography>
                </Box>
              </Box>
              <ExportToExcel
                apiData={data}
                fileName="stock"
                sheetName="STOCK"
                disabled={statusCode !== ``}
                callback={() =>
                  client(token).mutate({
                    mutation: gql`
                      mutation CreateLog {
                        createLog(input: {
                          data: {
                            action: "action",
                            description: "download -> stock -> ${
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

export default StockPage
