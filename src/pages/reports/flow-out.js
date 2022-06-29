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
import renderNumberAsText from "../../functions/render-number-as-text"
import {
  exportedDataSelect,
  displayStatus,
  printSeverity,
} from "../../functions/reports"
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

const FlowOutPage = () => {
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

  const getData = useCallback(async () => {
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

        // setPercent((i * 100) / lap)
        setPercentDialog(prev =>
          updateAnObjectInArray(prev, `id`, 1, {
            percent: (i * 100) / lap,
          })
        )
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
          <Seo title="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา" />
          <Breadcrumbs
            previous={[
              {
                name: `การออกรายงาน`,
                link: `/reports/`,
              },
            ]}
            current="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)"
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
          <PercentDialog data={percentDialog} />
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default FlowOutPage
