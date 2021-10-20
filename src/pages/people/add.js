import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material"
import { green } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faTimes,
  faCheckCircle as faFilledCheckCircle,
} from "@fortawesome/free-solid-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"
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

const textfieldProps = {
  width: `100%`,
}

const selectProps = {
  ".MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium.MuiSelect-icon.MuiSelect-iconOutlined":
    {
      display: `none`,
    },
}

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

  const renderCheckingIcon = value => {
    if (value === ``) {
      return (
        <InputAdornment position="end">
          <FontAwesomeIcon icon={faCheckCircle} />
        </InputAdornment>
      )
    }

    return (
      <InputAdornment position="end">
        <FontAwesomeIcon
          icon={faFilledCheckCircle}
          style={{ color: green[500] }}
        />
      </InputAdornment>
    )
  }

  const handleSubmit = e => {
    console.log(`ssassss`)
  }

  const clearInput = () => {
    setPrename(``)
    setName(``)
    setSurname(``)
    setIdCard(``)
    setSidCard(``)
    setGender(``)
    setBirthDate(``)
    setMarriedStatus(``)
    setTelephone(``)
    setAddress(``)
    setEmergencyName(``)
    setEmergencyNumber(``)
    setStartDate(``)
    setEduLevel(``)
    setEduName(``)
    setEduGraduated(``)
    setEduCountry(``)
    setMovementType(``)
    setOutline(``)
    setSouth(``)
    setRewardType1(``)
    setRewardType2(``)
    setRewardType3(``)
    setContactCnt(``)
    setMission(``)
    setCurrentContactStart(``)
    setCurrentContactEnd(``)
    setGuilty(``)
    setPunish(``)
    setDecoration(``)
    setPercentSalary(``)
    setScoreKPI(``)
    setScoreCompetence(``)
    setStatusDisability(``)
  }

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

          <Form
            onSubmit={e => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="prefix-id">* คำนำหน้าชื่อ</InputLabel>
                  <Select
                    sx={selectProps}
                    labelId="prefix-id"
                    id="Prename"
                    label="* คำนำหน้าชื่อ"
                    onChange={e => setPrename(e.target.value)}
                    value={prename}
                    endAdornment={renderCheckingIcon(prename)}
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
                  label="* หมายเลขประจำตัวประชาชน"
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
                  label="* หมายเลขประจำตัวข้าราชการกองทัพบก"
                  variant="outlined"
                  onChange={e => setSidCard(e.target.value)}
                  value={sidCard}
                  InputProps={{
                    endAdornment: renderCheckingIcon(sidCard),
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel id="gender-id">* เพศ</InputLabel>
                  <Select
                    sx={selectProps}
                    labelId="gender-id"
                    id="Gender"
                    label="* เพศ"
                    onChange={e => setGender(e.target.value)}
                    value={gender}
                    endAdornment={renderCheckingIcon(gender)}
                  >
                    <MenuItem value="" selected>
                      ---
                    </MenuItem>
                    <MenuItem value="ชาย">ชาย</MenuItem>
                    <MenuItem value="หญิง">หญิง</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="BirthDate"
                  label="* วันเดือนปีเกิด"
                  variant="outlined"
                  onChange={e => setBirthDate(e.target.value)}
                  value={birthDate}
                  InputProps={{
                    endAdornment: renderCheckingIcon(birthDate),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="marriedStatus-id">* สถานภาพสมรส</InputLabel>
                  <Select
                    sx={selectProps}
                    labelId="marriedStatus-id"
                    id="MarriedStatus"
                    label="* สถานภาพสมรส"
                    onChange={e => setMarriedStatus(e.target.value)}
                    value={marriedStatus}
                    endAdornment={renderCheckingIcon(marriedStatus)}
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
                    endAdornment: renderCheckingIcon(emergencyNumber),
                  }}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12}>
                <TextField
                  sx={textfieldProps}
                  id="StartDate"
                  label="* วันเริ่มทำสัญญา"
                  variant="outlined"
                  onChange={e => setStartDate(e.target.value)}
                  value={startDate}
                  InputProps={{
                    endAdornment: renderCheckingIcon(startDate),
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="Edu_Level"
                  label="* ระดับการศึกษา"
                  variant="outlined"
                  onChange={e => setEduLevel(e.target.value)}
                  value={eduLevel}
                  InputProps={{
                    endAdornment: renderCheckingIcon(eduLevel),
                  }}
                />
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
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="MovementType"
                  label="* ชื่อประเภทการเคลื่อนไหวล่าสุด"
                  variant="outlined"
                  onChange={e => setMovementType(e.target.value)}
                  value={movementType}
                  InputProps={{
                    endAdornment: renderCheckingIcon(movementType),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="Outline"
                  label="* กรอบอัตรากำลัง"
                  variant="outlined"
                  onChange={e => setOutline(e.target.value)}
                  value={outline}
                  InputProps={{
                    endAdornment: renderCheckingIcon(outline),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="South"
                  label="* อัตรากำลังจังหวัดชายแดนภาคใต้"
                  variant="outlined"
                  onChange={e => setSouth(e.target.value)}
                  value={south}
                  InputProps={{
                    endAdornment: renderCheckingIcon(south),
                  }}
                />
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
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="RewardType3"
                  label="ค่าครองชีพชั่วคราว"
                  variant="outlined"
                  onChange={e => setRewardType3(e.target.value)}
                  value={rewardType3}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="ContactCnt"
                  label="* จำนวนครั้งที่ทำสัญญา"
                  variant="outlined"
                  onChange={e => setContactCnt(e.target.value)}
                  value={contactCnt}
                  InputProps={{
                    endAdornment: renderCheckingIcon(contactCnt),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="Mission"
                  label="* ประเภทภารกิจ"
                  variant="outlined"
                  onChange={e => setMission(e.target.value)}
                  value={mission}
                  InputProps={{
                    endAdornment: renderCheckingIcon(mission),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="CurrentContactStart"
                  label="* วันที่เริ่มสัญญาปัจจุบัน"
                  variant="outlined"
                  onChange={e => setCurrentContactStart(e.target.value)}
                  value={currentContactStart}
                  InputProps={{
                    endAdornment: renderCheckingIcon(currentContactStart),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  sx={textfieldProps}
                  id="CurrentContactEnd"
                  label="* วันที่สิ้นสุดสัญญาปัจจุบัน"
                  variant="outlined"
                  onChange={e => setCurrentContactEnd(e.target.value)}
                  value={currentContactEnd}
                  InputProps={{
                    endAdornment: renderCheckingIcon(currentContactEnd),
                  }}
                />
              </Grid>
            </Grid>
            <Divider style={{ margin: `1rem auto 2rem`, width: 360 }} />
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="Guilty"
                  label="ความผิดทางวินัย"
                  variant="outlined"
                  onChange={e => setGuilty(e.target.value)}
                  value={guilty}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="Punish"
                  label="ประเภทโทษทางวินัย"
                  variant="outlined"
                  onChange={e => setPunish(e.target.value)}
                  value={punish}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="Decoration"
                  label="เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ"
                  variant="outlined"
                  onChange={e => setDecoration(e.target.value)}
                  value={decoration}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={textfieldProps}
                  id="PercentSalary"
                  label="ร้อยละที่ได้รับการเลื่อนเงินเดือน"
                  variant="outlined"
                  onChange={e => setPercentSalary(e.target.value)}
                  value={percentSalary}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="ScoreKPI"
                  label="คะแนนผลสัมฤทธิ์ของงาน"
                  variant="outlined"
                  onChange={e => setScoreKPI(e.target.value)}
                  value={scoreKPI}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="ScoreCompetence"
                  label="คะแนนประเมินสมรรถนะ"
                  variant="outlined"
                  onChange={e => setScoreCompetence(e.target.value)}
                  value={scoreCompetence}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={textfieldProps}
                  id="StatusDisability"
                  label="สภานภาพทางกาย"
                  variant="outlined"
                  onChange={e => setStatusDisability(e.target.value)}
                  value={statusDisability}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ marginBottom: `1rem` }}>
              <Grid item xs={12} sm={8}>
                <Button
                  fullWidth
                  color="primary"
                  variant="contained"
                  type="submit"
                  disabled={
                    name === `` ||
                    surname === `` ||
                    idCard === `` ||
                    sidCard === `` ||
                    gender === `` ||
                    birthDate === `` ||
                    marriedStatus === `` ||
                    telephone === `` ||
                    address === `` ||
                    emergencyName === `` ||
                    emergencyNumber === `` ||
                    startDate === `` ||
                    eduLevel === `` ||
                    eduName === `` ||
                    eduGraduated === `` ||
                    eduCountry === `` ||
                    movementType === `` ||
                    outline === `` ||
                    south === `` ||
                    rewardType1 === `` ||
                    contactCnt === `` ||
                    mission === `` ||
                    currentContactStart === `` ||
                    currentContactEnd === ``
                  }
                >
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
                  เพิ่มรายการ
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                {(prename !== `` ||
                  name !== `` ||
                  surname !== `` ||
                  idCard !== `` ||
                  sidCard !== `` ||
                  gender !== `` ||
                  birthDate !== `` ||
                  marriedStatus !== `` ||
                  telephone !== `` ||
                  address !== `` ||
                  emergencyName !== `` ||
                  emergencyNumber !== `` ||
                  startDate !== `` ||
                  eduLevel !== `` ||
                  eduName !== `` ||
                  eduGraduated !== `` ||
                  eduCountry !== `` ||
                  movementType !== `` ||
                  outline !== `` ||
                  south !== `` ||
                  rewardType1 !== `` ||
                  rewardType2 !== `` ||
                  rewardType3 !== `` ||
                  contactCnt !== `` ||
                  mission !== `` ||
                  currentContactStart !== `` ||
                  currentContactEnd !== `` ||
                  guilty !== `` ||
                  punish !== `` ||
                  decoration !== `` ||
                  percentSalary !== `` ||
                  scoreKPI !== `` ||
                  scoreCompetence !== `` ||
                  statusDisability !== ``) && (
                  <Button
                    fullWidth
                    color="error"
                    variant="outlined"
                    type="reset"
                    onClick={() => clearInput()}
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ marginRight: 5 }}
                    />
                    ล้าง
                  </Button>
                )}
              </Grid>
            </Grid>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default AddPositionsPage
