import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { TextField } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import ExportToExcel from "../../components/ExportToExcel"
import { Form, Flex } from "../../components/Styles"
import renderDivision from "../../functions/renderDivision"
import renderNumberAsText from "../../functions/renderNumberAsText"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const FlowOutPage = () => {
  const { token, url, userInfo, units } = useSelector(state => state)
  const dispatch = useDispatch()

  const [input, setInput] = useState({
    unit: null,
  })
  const [data, setData] = useState([])
  const [statusCode, setStatusCode] = useState(``)

  const getData = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })

    const condition =
      input.unit !== null
        ? `(where: {
          position: {
            division: "${input.unit._id}"
          }
        })`
        : `(where: {
          position_null: false
        })`

    try {
      const res = await client.query({
        query: gql`
          query People {
            people${condition} {
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

      if (res) {
        let returnData = []

        if (res.data.people.length > 0) {
          for (let person of res.data.people) {
            returnData = [
              ...returnData,
              {
                ชื่อกระทรวง: "กระทรวงกลาโหม",
                ชื่อกรม: person.position.division.division1,
                "ชื่อสำนัก/กอง": renderDivision(person.position.division),
                เลขที่ตำแหน่ง: person.position.number,
                ชื่อตำแหน่งในสายงาน: person.position.position_type.name,
                ชื่อประเภทกลุ่มงาน: person.position.position_type.type,
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
        } else {
          setStatusCode(`0`)
        }

        setData(returnData)
      }
    } catch {
      setStatusCode(`connection`)
    }
  }, [url, input.unit])

  useEffect(() => {
    getData()
  }, [getData, input.unit])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `reports`,
    })
  }, [dispatch])

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
                />
              </Flex>
              <ExportToExcel
                apiData={data}
                fileName="flow-out"
                sheetName="FLOW-OUT"
                statusCode={statusCode}
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
