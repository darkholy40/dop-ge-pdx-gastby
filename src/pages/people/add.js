import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Button,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  // max-width: 400px;
  // margin: auto;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
`

const AddPositionsPage = () => {
  const { token, userInfo, url, addPositionFilter } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [isError, setIsError] = useState({
    status: false,
    type: ``,
    text: ``,
  })
  const [prename, setPrename] = useState(``)
  const [name, setName] = useState(``)
  const [surname, setSurname] = useState(``)
  const [idCard, setIdCard] = useState(``)
  const [sidCard, setSidCard] = useState(``)
  const [gender, setGender] = useState(``)
  const [birthDate, setBirthDate] = useState(``)
  const [marriedStatus, setMarriedStatus] = useState(``)
  const [telephone, setTelephone] = useState(``)
  const [address, setAddress] = useState(``)
  const [emergencyName, setEmergencyName] = useState(``)
  const [emergencyNumber, setEmergencyNumber] = useState(``)
  const [startDate, setStartDate] = useState(``)

  const [eduLevel, setEduLevel] = useState(``)
  const [eduName, setEduName] = useState(``)
  const [eduGraduated, setEduGraduated] = useState(``)
  const [eduCountry, setEduCountry] = useState(``)

  const [movementType, setMovementType] = useState(``)
  const [outline, setOutline] = useState(``)
  const [south, setSouth] = useState(``)

  const [rewardType1, setRewardType1] = useState(``)
  const [rewardType2, setRewardType2] = useState(``)
  const [rewardType3, setRewardType3] = useState(``)

  const [contactCnt, setContactCnt] = useState(``)
  const [mission, setMission] = useState(``)
  const [currentContactStart, setCurrentContactStart] = useState(``)
  const [currentContactEnd, setCurrentContactEnd] = useState(``)

  const [guilty, setGuilty] = useState(``)
  const [punish, setPunish] = useState(``)

  const [decoration, setDecoration] = useState(``)
  const [percentSalary, setPercentSalary] = useState(``)

  const [scoreKPI, setScoreKPI] = useState(``)
  const [scoreCompetence, setScoreCompetence] = useState(``)
  const [statusDisability, setStatusDisability] = useState(``)

  const goAdd = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let posNumberIsExisted = false

    setIsError({
      status: false,
      type: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client.query({
        query: gql`
          query Positions {
            positions(where: {
              Pos_Number: "${addPositionFilter.posNumber}"
            }) {
              _id
              Pos_Name
              Pos_Type
              Pos_Number
              Pos_Open
              Pos_South
              staff_created
              staff_updated
              published_at
              createdAt
              updatedAt
            }
          }
        `,
      })

      if (res.data.positions.length > 0) {
        posNumberIsExisted = true

        setIsError({
          status: true,
          type: `posNumberIsExisted`,
          text: `มีเลขที่ตำแหน่งนี้ในฐานข้อมูลแล้ว`,
        })
      }
    } catch {
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `เพิ่มรายการไม่สำเร็จ`,
          description: `ไม่สามารถเพิ่มรายการคลังตำแหน่งได้`,
          variant: `error`,
          callback: () => {},
        },
      })

      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropOpen: false,
      })

      return 0
    }

    if (!posNumberIsExisted) {
      try {
        await client.mutate({
          mutation: gql`
            mutation CreatePosition {
              createPosition(input: {
                data: {
                  Pos_Name: "${addPositionFilter.posName}",
                  Pos_Type: "${addPositionFilter.posType}",
                  Pos_Number: "${addPositionFilter.posNumber}",
                  Pos_Open: ${addPositionFilter.posOpen},
                  Pos_South: ${addPositionFilter.posSouth},
                  staff_created: "${userInfo._id}",
                }
              }) {
                position {
                  _id
                  Pos_Name
                  Pos_Type
                  Pos_Number
                  Pos_Open
                  Pos_South
                  published_at
                  createdAt
                  updatedAt
                }
              }
            }
          `,
        })
        // console.log(res)

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เพิ่มรายการสำเร็จ`,
            description: `เพิ่มรายการคลังตำแหน่งสำเร็จ`,
            variant: `success`,
            callback: () => {
              resetInput()
            },
          },
        })
      } catch (error) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เพิ่มรายการไม่สำเร็จ`,
            description: `ไม่สามารถเพิ่มรายการคลังตำแหน่งได้`,
            variant: `error`,
            callback: () => {},
          },
        })

        console.log(error)
      }
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }

  const resetInput = useCallback(() => {
    dispatch({
      type: `SET_ADD_POSITION_FILTER`,
      addPositionFilter: {
        posName: ``,
        posType: ``,
        posNumber: ``,
        posOpen: false,
        posSouth: false,
      },
    })
  }, [dispatch])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== "" ? (
        <>
          <Seo title="เพิ่มคลังตำแหน่ง" />
          <Breadcrumbs
            previous={[
              {
                name: `จัดการประวัติกำลังพล`,
                link: `/people`,
              },
            ]}
            current="เพิ่ม"
          />

          <Form>
            <Row>
              <FormControl fullWidth sx={{ marginRight: `1rem` }}>
                <InputLabel id="prefix-id">คำนำหน้าชื่อ</InputLabel>
                <Select
                  labelId="prefix-id"
                  id="Prename"
                  label="คำนำหน้าชื่อ"
                  onChange={e => setPrename(e.target.value)}
                  value={prename}
                >
                  <MenuItem value="" selected>
                    ---
                  </MenuItem>
                  <MenuItem value="นาย">นาย</MenuItem>
                  <MenuItem value="นาง">นาง</MenuItem>
                  <MenuItem value="นางสาว">นางสาว</MenuItem>
                  <MenuItem value="ว่าที่ ร.ต.">ว่าที่ ร.ต.</MenuItem>
                  <MenuItem value="ว่าที่ ร.ต.หญิง">ว่าที่ ร.ต.หญิง</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Name"
                label="ชื่อ"
                variant="outlined"
                onChange={e => setName(e.target.value)}
                value={name}
              />
              <TextField
                sx={{ width: `100%` }}
                id="Surname"
                label="นามสกุล"
                variant="outlined"
                onChange={e => setSurname(e.target.value)}
                value={surname}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="ID_Card"
                label="หมายเลขประจำตัวประชาชน"
                variant="outlined"
                onChange={e => setIdCard(e.target.value)}
                value={idCard}
              />
              <TextField
                sx={{ width: `100%` }}
                id="SID_Card"
                label="หมายเลขประจำตัวข้าราชการกองทัพบก"
                variant="outlined"
                onChange={e => setSidCard(e.target.value)}
                value={sidCard}
              />
            </Row>
            <Row>
              <FormControl
                sx={{ width: `100%`, maxWidth: 100, marginRight: `1rem` }}
              >
                <InputLabel id="gender-id">เพศ</InputLabel>
                <Select
                  labelId="gender-id"
                  id="Gender"
                  label="เพศ"
                  onChange={e => setGender(e.target.value)}
                  value={gender}
                >
                  <MenuItem value="" selected>
                    ---
                  </MenuItem>
                  <MenuItem value="ชาย">ชาย</MenuItem>
                  <MenuItem value="หญิง">หญิง</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="BirthDate"
                label="วันเดือนปีเกิด"
                variant="outlined"
                onChange={e => setBirthDate(e.target.value)}
                value={birthDate}
              />
              <FormControl
                sx={{ width: `100%`, maxWidth: 150, marginRight: `1rem` }}
              >
                <InputLabel id="marriedStatus-id">สถานภาพสมรส</InputLabel>
                <Select
                  labelId="marriedStatus-id"
                  id="MarriedStatus"
                  label="สถานภาพสมรส"
                  onChange={e => setMarriedStatus(e.target.value)}
                  value={marriedStatus}
                >
                  <MenuItem value="" selected>
                    ---
                  </MenuItem>
                  <MenuItem value="โสด">โสด</MenuItem>
                  <MenuItem value="สมรส">สมรส</MenuItem>
                  <MenuItem value="หม้าย">หม้าย</MenuItem>
                  <MenuItem value="หย่า">หย่า</MenuItem>
                  <MenuItem value="แยกกันอยู่">แยกกันอยู่</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={{ width: `100%` }}
                id="Telephone"
                label="หมายเลขโทรศัพท์"
                variant="outlined"
                onChange={e => setTelephone(e.target.value)}
                value={telephone}
              />
            </Row>
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="Address"
              label="ที่อยู่"
              variant="outlined"
              onChange={e => setAddress(e.target.value)}
              value={address}
            />
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Emergency_Name"
                label="ชื่อผู้ติดต่อฉุกเฉิน"
                variant="outlined"
                onChange={e => setEmergencyName(e.target.value)}
                value={emergencyName}
              />
              <TextField
                sx={{ width: `100%` }}
                id="Emergency_Number"
                label="หมายเลขโทรศัพท์ผู้ติดต่อฉุกเฉิน"
                variant="outlined"
                onChange={e => setEmergencyNumber(e.target.value)}
                value={emergencyNumber}
              />
            </Row>
            <Divider style={{ margin: `0 1rem 1rem` }} />
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="StartDate"
              label="วันเริ่มทำสัญญา"
              variant="outlined"
              onChange={e => setStartDate(e.target.value)}
              value={startDate}
            />
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Edu_Level"
                label="ระดับการศึกษา"
                variant="outlined"
                onChange={e => setEduLevel(e.target.value)}
                value={eduLevel}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Edu_Name"
                label="ชื่อวุฒิการศึกษา"
                variant="outlined"
                onChange={e => setEduName(e.target.value)}
                value={eduName}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Edu_Graduated"
                label="ชื่อสถาบันที่สำเร็จการศึกษา"
                variant="outlined"
                onChange={e => setEduGraduated(e.target.value)}
                value={eduGraduated}
              />
              <TextField
                sx={{ width: `100%` }}
                id="Edu_Country"
                label="ชื่อประเทศ"
                variant="outlined"
                onChange={e => setEduCountry(e.target.value)}
                value={eduCountry}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="MovementType"
                label="ชื่อประเภทการเคลื่อนไหวล่าสุด"
                variant="outlined"
                onChange={e => setMovementType(e.target.value)}
                value={movementType}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Outline"
                label="กรอบอัตรากำลัง"
                variant="outlined"
                onChange={e => setOutline(e.target.value)}
                value={outline}
              />
              <TextField
                sx={{ width: `100%` }}
                id="South"
                label="อัตรากำลังจังหวัดชายแดนภาคใต้"
                variant="outlined"
                onChange={e => setSouth(e.target.value)}
                value={south}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="RewardType1"
                label="ค่าตอบแทนปัจจุบัน(เงินเดือน)"
                variant="outlined"
                onChange={e => setRewardType1(e.target.value)}
                value={rewardType1}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="RewardType2"
                label="ค่าตอบแทนสำหรับตำแหน่งที่มีเหตุพิเศษ"
                variant="outlined"
                onChange={e => setRewardType2(e.target.value)}
                value={rewardType2}
              />
              <TextField
                sx={{ width: `100%` }}
                id="RewardType3"
                label="ค่าครองชีพชั่วคราว"
                variant="outlined"
                onChange={e => setRewardType3(e.target.value)}
                value={rewardType3}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="ContactCnt"
                label="จำนวนครั้งที่ทำสัญญา"
                variant="outlined"
                onChange={e => setContactCnt(e.target.value)}
                value={contactCnt}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Mission"
                label="ประเภทภารกิจ"
                variant="outlined"
                onChange={e => setMission(e.target.value)}
                value={mission}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="CurrentContactStart"
                label="วันที่เริ่มสัญญาปัจจุบัน"
                variant="outlined"
                onChange={e => setCurrentContactStart(e.target.value)}
                value={currentContactStart}
              />
              <TextField
                sx={{ width: `100%` }}
                id="CurrentContactEnd"
                label="วันที่สิ้นสุดสัญญาปัจจุบัน"
                variant="outlined"
                onChange={e => setCurrentContactEnd(e.target.value)}
                value={currentContactEnd}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Guilty"
                label="ความผิดทางวินัย"
                variant="outlined"
                onChange={e => setGuilty(e.target.value)}
                value={guilty}
              />
              <TextField
                sx={{ width: `100%` }}
                id="Punish"
                label="ประเภทโทษทางวินัย"
                variant="outlined"
                onChange={e => setPunish(e.target.value)}
                value={punish}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="Decoration"
                label="เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ"
                variant="outlined"
                onChange={e => setDecoration(e.target.value)}
                value={decoration}
              />
              <TextField
                sx={{ width: `100%` }}
                id="PercentSalary"
                label="ร้อยละที่ได้รับการเลื่อนเงินเดือน"
                variant="outlined"
                onChange={e => setPercentSalary(e.target.value)}
                value={percentSalary}
              />
            </Row>
            <Row>
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="ScoreKPI"
                label="คะแนนผลสัมฤทธิ์ของงาน"
                variant="outlined"
                onChange={e => setScoreKPI(e.target.value)}
                value={scoreKPI}
              />
              <TextField
                sx={{ width: `100%`, marginRight: `1rem` }}
                id="ScoreCompetence"
                label="คะแนนประเมินสมรรถนะ"
                variant="outlined"
                onChange={e => setScoreCompetence(e.target.value)}
                value={scoreCompetence}
              />
              <TextField
                sx={{ width: `100%` }}
                id="StatusDisability"
                label="สภานภาพทางกาย"
                variant="outlined"
                onChange={e => setStatusDisability(e.target.value)}
                value={statusDisability}
              />
            </Row>

            <Button
              color="primary"
              variant="contained"
              onClick={() => goAdd()}
              disabled={
                addPositionFilter.posName === `` ||
                addPositionFilter.posType === `` ||
                addPositionFilter.posNumber === ``
              }
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
              เพิ่มรายการ
            </Button>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default AddPositionsPage
