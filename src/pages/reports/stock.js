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
import renderThaiDate from "../../functions/renderThaiDate"
import renderNumberAsText from "../../functions/renderNumberAsText"
import renderPositionStatus from "../../functions/renderPositionStatus"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const StockPage = () => {
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
      division: "${input.unit._id}"
    })`
        : ``

    try {
      const res = await client.query({
        query: gql`
          query Positions {
            positions${condition} {
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

      if (res) {
        let returnData = []

        if (res.data.positions.length > 0) {
          for (let position of res.data.positions) {
            returnData = [
              ...returnData,
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
                  position.person !== null ? position.person.MovementType : ``,
                กรอบอัตรากำลัง:
                  position.person !== null ? position.person.Outline : ``,
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
                    ? renderThaiDate(position.person.CurrentContactStart)
                    : ``,
                วันที่สิ้นสุดสัญญาปัจจุบัน:
                  position.person !== null
                    ? renderThaiDate(position.person.CurrentContactEnd)
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
                    ? renderNumberAsText(position.person.PercentSalary)
                    : ``,
                คะแนนผลสัมฤทธิ์ของงาน:
                  position.person !== null
                    ? renderNumberAsText(position.person.ScoreKPI)
                    : ``,
                คะแนนประเมินสมรรถนะ:
                  position.person !== null
                    ? renderNumberAsText(position.person.ScoreCompetence)
                    : ``,
                สภานภาพทางกาย:
                  position.person !== null
                    ? position.person.StatusDisability
                    : ``,
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
                />
              </Flex>
              <ExportToExcel
                apiData={data}
                fileName="stock"
                sheetName="STOCK"
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

export default StockPage
