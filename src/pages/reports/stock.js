import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { TextField, Alert } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import ExportToExcel from "../../components/export-to-excel"
import { Form, Flex } from "../../components/styles"
import PercentDialog from "../../components/percent-dialog"
import renderDivision from "../../functions/render-division"
import renderThaiDate from "../../functions/render-thai-date"
import renderNumberAsText from "../../functions/render-number-as-text"
import {
  exportedDataSelect,
  displayStatus,
  printSeverity,
} from "../../functions/reports"
import renderPositionStatus from "../../functions/render-position-status"
import {
  updateAnObjectInArray,
  removeObjectInArray,
} from "../../functions/object-in-array"
import roles from "../../static/roles"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const StockPage = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { units } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [input, setInput] = useState({
    option: null,
    unit: null,
  })
  const [data, setData] = useState([])
  const [statusCode, setStatusCode] = useState(`selecting`)
  // const [percent, setPercent] = useState(0)
  const [percentDialog, setPercentDialog] = useState([])

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

  const getData = useCallback(async () => {
    let lap = 0

    setStatusCode(`loading`)
    // setPercent(0)
    setPercentDialog(prev => [
      ...prev,
      {
        id: 1,
        open: true,
        title: `กำลังโหลดข้อมูล...`,
        percent: 0,
      },
    ])

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
                  type
                  skills
                  education_level {
                    name
                  }
                  education_name {
                    full_name
                  }
                  educational_institution {
                    name
                  }
                  country {
                    name
                  }
                  decoration {
                    full_name
                  }
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

        // setPercent((i * 100) / lap)
        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 1, {
            percent: (i * 100) / lap,
          })
        )
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
                position.person !== null &&
                position.person.education_level !== null
                  ? position.person.education_level.name
                  : ``,
              ทักษะประสบการณ์:
                position.person !== null ? position.person.skills || `-` : ``,
              "ชื่อวุฒิการศึกษา(ในตำแหน่ง)":
                position.person !== null &&
                position.person.education_name !== null
                  ? position.person.education_name.full_name
                  : ``,
              "ชื่อสถาบันการศึกษาที่สำเร็จการศึกษา(ในตำแหน่ง)":
                position.person !== null &&
                position.person.educational_institution !== null
                  ? position.person.educational_institution.name
                  : ``,
              ชื่อประเทศที่สำเร็จการศึกษา:
                position.person !== null && position.person.country !== null
                  ? position.person.country.name
                  : ``,
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
                position.person !== null && position.person.decoration !== null
                  ? position.person.decoration.full_name
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

    // setPercent(100)
    setPercentDialog(prev =>
      updateAnObjectInArray(prev, `id`, 1, {
        percent: 100,
      })
    )
    setTimeout(() => {
      // setPercent(0)
      setPercentDialog(prev => removeObjectInArray(prev, `id`, 1))
    }, 300)
  }, [token, input.unit])

  useEffect(() => {
    if (input.option !== null) {
      // search all
      if (input.option.id === 1) {
        getData()
      }

      // search -> filter by unit
      if (input.option.id === 2 && input.unit !== null) {
        getData()
      }
    }
  }, [getData, input])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `reports`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 2 ? (
        <>
          <Seo title="รายชื่อพนักงานราชการและตำแหน่งว่าง" />
          <Breadcrumbs
            previous={[
              {
                name: `การออกรายงาน`,
                link: `/reports/`,
              },
            ]}
            current="รายชื่อพนักงานราชการและตำแหน่งว่าง (Stock)"
          />

          <Container>
            <Form
              onSubmit={e => e.preventDefault()}
              style={{ width: `100%`, maxWidth: `400px` }}
            >
              <Flex style={{ marginBottom: `1rem` }}>
                <Autocomplete
                  sx={{ width: `100%` }}
                  id="exported-data"
                  disablePortal
                  options={exportedDataSelect}
                  noOptionsText={`ไม่พบข้อมูล`}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) => {
                    return option.id === value.id
                  }}
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setInput(prev => ({
                        ...prev,
                        option: newValue,
                        unit: null,
                      }))
                      setStatusCode(`selecting-unit`)
                    } else {
                      setInput(prev => ({
                        ...prev,
                        option: null,
                        unit: null,
                      }))
                      setStatusCode(`selecting`)
                    }
                  }}
                  value={input.option}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="เลือกข้อมูลนำออก"
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
              {input.option !== null && input.option.id === 2 && (
                <Flex style={{ marginBottom: `1rem` }}>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="unit"
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
                        setStatusCode(`selecting-unit`)
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
              )}
              <Alert
                sx={{ marginBottom: `1rem`, animation: `fadein 0.3s` }}
                severity={printSeverity(statusCode)}
              >
                {displayStatus(statusCode)}
              </Alert>
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
          <PercentDialog data={percentDialog} />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default StockPage
