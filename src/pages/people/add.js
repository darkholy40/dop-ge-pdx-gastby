import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
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
  // Alert,
  Divider,
} from "@mui/material"
import MobileDatePicker from "@mui/lab/MobileDatePicker"
import Autocomplete from "@mui/material/Autocomplete"
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
import renderDateForGraphQL from "../../functions/renderDateForGraphQL"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  // max-width: 400px;
  // margin: auto;
`

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

const CheckCircleFlex = styled.div`
  border-radius: 0 5px 5px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.24);
  border-right: 1px solid rgba(0, 0, 0, 0.24);
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);
  height: 54px;
  width: 30px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
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

const datePickerProps = {
  disableMaskedInput: true,
  clearable: true,
  clearText: "ล้าง",
  okText: "ตกลง",
  cancelText: "ยกเลิก",
  todayText: "วันนี้",
  inputFormat: "d MMMM yyyy",
  showToolbar: false,
  inputProps: {
    readOnly: true,
    placeholder: "",
    style: {
      marginLeft: 15,
    },
  },
}

const AddPositionsPage = () => {
  const { token, userInfo, url } = useSelector(state => state)
  const dispatch = useDispatch()
  const [positions, setPositions] = useState([])
  const [isError, setIsError] = useState({
    status: ``,
    text: ``,
  })
  const [prename, setPrename] = useState(``)
  const [name, setName] = useState(``)
  const [surname, setSurname] = useState(``)
  const [idCard, setIdCard] = useState(``)
  const [sidCard, setSidCard] = useState(``)
  const [positionInput, setPositionInput] = useState(null)
  const [gender, setGender] = useState(``)
  const [birthDate, setBirthDate] = useState(null)
  const [marriedStatus, setMarriedStatus] = useState(``)
  const [telephone, setTelephone] = useState(``)
  const [address, setAddress] = useState(``)
  const [emergencyName, setEmergencyName] = useState(``)
  const [emergencyNumber, setEmergencyNumber] = useState(``)
  const [startDate, setStartDate] = useState(null)
  const [eduLevel, setEduLevel] = useState(``)
  const [eduName, setEduName] = useState(``)
  const [eduGraduated, setEduGraduated] = useState(``)
  const [eduCountry, setEduCountry] = useState(``)
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
  const [decoration, setDecoration] = useState(``)
  const [percentSalary, setPercentSalary] = useState(``)
  const [scoreKPI, setScoreKPI] = useState(``)
  const [scoreCompetence, setScoreCompetence] = useState(``)
  const [statusDisability, setStatusDisability] = useState(``)

  const getPositions = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let role = ``

    if (userInfo.role.name !== `Administrator`) {
      role = `staff_created: "${userInfo.id}"`
    }

    try {
      const res = await client.query({
        query: gql`
          query Positions {
            positions(where: {
              Pos_Open: true
              ${role}
              person_id: ""
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
        setPositions(res.data.positions)
      } else {
        setIsError({
          status: `notfound`,
          text: `ไม่พบข้อมูล`,
        })
      }
    } catch {
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `เชื่อมต่อฐานข้อมูลไม่สำเร็จ`,
          description: `ไม่สามารถรับข้อมูลคลังตำแหน่งได้`,
          variant: `error`,
          confirmText: `เชื่อมต่ออีกครั้ง`,
          callback: () => {
            getPositions()
          },
        },
      })
    }
  }, [url, userInfo.id, userInfo.role.name, dispatch])

  const goAdd = async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let getPersonID = ``

    setIsError({
      status: ``,
      text: ``,
    })
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client.mutate({
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
                BirthDate: "${renderDateForGraphQL(birthDate)}",
                MarriedStatus: "${marriedStatus}",
                Telephone: "${telephone}",
                Address: "${address}",
                Emergency_Name: "${emergencyName}",
                Emergency_Number: "${emergencyNumber}",
                StartDate: "${renderDateForGraphQL(startDate)}",
                Edu_Level: "${eduLevel}",
                Edu_Name: "${eduName}",
                Edu_Graduated: "${eduGraduated}",
                Edu_Country: "${eduCountry}",
                MovementType: "${movementType}",
                Outline: "${outline}",
                RewardType1: "${rewardType1}",
                RewardType2: "${rewardType2}",
                RewardType3: "${rewardType3}",
                ContactCnt: "${contactCnt}",
                Mission: "${mission}",
                CurrentContactStart: "${renderDateForGraphQL(
                  currentContactStart
                )}",
                CurrentContactEnd: "${renderDateForGraphQL(currentContactEnd)}",
                Guilty: "${guilty}",
                Punish: "${punish}",
                Decoration: "${decoration}",
                PercentSalary: "${percentSalary}",
                ScoreKPI: "${scoreKPI}",
                ScoreCompetence: "${scoreCompetence}",
                StatusDisability: "${statusDisability}",
                staff_created: "${userInfo.id}",
                staff_updated: "",
              }
            }) {
              person {
                _id
              }
            }
          }
        `,
      })
      console.log(res)
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
          title: `เพิ่มรายการไม่สำเร็จ`,
          description: `ไม่สามารถเพิ่มรายการกำลังพลได้`,
          variant: `error`,
          confirmText: `ลองอีกครั้ง`,
          callback: () => goAdd(),
        },
      })

      console.log(error)
    }

    if (getPersonID !== ``) {
      try {
        await client.mutate({
          mutation: gql`
            mutation UpdatePosition {
              updatePosition(input: {
                where: {
                  id: "${positionInput._id}"
                }
                data: {
                  person_id: "${getPersonID}"
                }
              }) {
                position {
                  _id
                  person_id
                }
              }
            }
          `,
        })

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เพิ่มรายการสำเร็จ`,
            description: `เพิ่มรายการกำลังพลสำเร็จ`,
            variant: `success`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/people`)
            },
          },
        })
      } catch (error) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เพิ่มรายการไม่สำเร็จ`,
            description: `ไม่สามารถเพิ่มรายการกำลังพลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => goAdd(),
          },
        })

        // สั่งลบ getPersonID ที่เพิ่มไปก่อนหน้าออก
        await client.mutate({
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
      backdropOpen: false,
    })
  }

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
    console.log(`Go Adding`)
    goAdd()
  }

  const clearInput = () => {
    setPrename(``)
    setName(``)
    setSurname(``)
    setIdCard(``)
    setSidCard(``)
    setPositionInput(null)
    setGender(``)
    setBirthDate(null)
    setMarriedStatus(``)
    setTelephone(``)
    setAddress(``)
    setEmergencyName(``)
    setEmergencyNumber(``)
    setStartDate(null)
    setEduLevel(``)
    setEduName(``)
    setEduGraduated(``)
    setEduCountry(``)
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

  useEffect(() => {
    getPositions()
  }, [getPositions])

  return (
    <Layout>
      {token !== "" ? (
        <>
          <Seo title="เพิ่มกำลังพล" />
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
              <Grid item xs={12}>
                <Flex>
                  <Autocomplete
                    sx={{ width: `100%` }}
                    id="position"
                    disablePortal
                    options={positions}
                    noOptionsText={
                      positions.length === 0
                        ? isError.status === `notfound`
                          ? `ไม่มีตำแหน่งว่าง`
                          : `กำลังเชื่อมต่อฐานข้อมูล...`
                        : `ไม่พบข้อมูล`
                    }
                    getOptionLabel={option =>
                      `${option.Pos_Name} / ${option.Pos_Type} (${option.Pos_Number})`
                    }
                    isOptionEqualToValue={(option, value) => {
                      return option._id === value._id
                    }}
                    onChange={(_, newValue) => {
                      setPositionInput(newValue)
                    }}
                    value={positionInput}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="ตำแหน่ง"
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
                <MobileDatePicker
                  {...datePickerProps}
                  id="BirthDate"
                  label="* วันเดือนปีเกิด"
                  onChange={newValue => {
                    setBirthDate(newValue)
                  }}
                  value={birthDate}
                  renderInput={params => {
                    return (
                      <TextField
                        {...params}
                        sx={textfieldProps}
                        InputProps={{
                          startAdornment: params.InputProps.endAdornment,
                          endAdornment: renderCheckingIcon(
                            birthDate === null ? `` : birthDate
                          ),
                        }}
                      />
                    )
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
                {/* <TextField
                  sx={textfieldProps}
                  id="StartDate"
                  label="* วันเริ่มทำสัญญา"
                  variant="outlined"
                  onChange={e => setStartDate(e.target.value)}
                  value={startDate}
                  InputProps={{
                    endAdornment: renderCheckingIcon(startDate),
                  }}
                /> */}

                <MobileDatePicker
                  {...datePickerProps}
                  id="StartDate"
                  label="* วันเริ่มทำสัญญา"
                  onChange={newValue => {
                    setStartDate(newValue)
                  }}
                  value={startDate}
                  renderInput={params => (
                    <TextField
                      {...params}
                      sx={textfieldProps}
                      InputProps={{
                        startAdornment: params.InputProps.endAdornment,
                        endAdornment: renderCheckingIcon(
                          startDate === null ? `` : startDate
                        ),
                      }}
                    />
                  )}
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
                <MobileDatePicker
                  {...datePickerProps}
                  id="CurrentContactStart"
                  label="* วันที่เริ่มสัญญาปัจจุบัน"
                  onChange={newValue => {
                    setCurrentContactStart(newValue)
                  }}
                  value={currentContactStart}
                  renderInput={params => (
                    <TextField
                      {...params}
                      sx={textfieldProps}
                      InputProps={{
                        startAdornment: params.InputProps.endAdornment,
                        endAdornment: renderCheckingIcon(
                          currentContactStart === null
                            ? ``
                            : currentContactStart
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MobileDatePicker
                  {...datePickerProps}
                  id="CurrentContactEnd"
                  label="* วันที่สิ้นสุดสัญญาปัจจุบัน"
                  onChange={newValue => {
                    setCurrentContactEnd(newValue)
                  }}
                  value={currentContactEnd}
                  renderInput={params => (
                    <TextField
                      {...params}
                      sx={textfieldProps}
                      InputProps={{
                        startAdornment: params.InputProps.endAdornment,
                        endAdornment: renderCheckingIcon(
                          currentContactEnd === null ? `` : currentContactEnd
                        ),
                      }}
                    />
                  )}
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
              <Grid item xs={12} sm={6}>
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
                    positionInput === null ||
                    gender === `` ||
                    birthDate === null ||
                    marriedStatus === `` ||
                    telephone === `` ||
                    address === `` ||
                    emergencyName === `` ||
                    emergencyNumber === `` ||
                    startDate === null ||
                    eduLevel === `` ||
                    eduName === `` ||
                    eduGraduated === `` ||
                    eduCountry === `` ||
                    movementType === `` ||
                    outline === `` ||
                    rewardType1 === `` ||
                    contactCnt === `` ||
                    mission === `` ||
                    currentContactStart === null ||
                    currentContactEnd === null
                  }
                >
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
                  เพิ่มรายการ
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  color="error"
                  type="reset"
                  onClick={() => clearInput()}
                  disabled={
                    prename === `` &&
                    name === `` &&
                    surname === `` &&
                    idCard === `` &&
                    sidCard === `` &&
                    positionInput === null &&
                    gender === `` &&
                    birthDate === null &&
                    marriedStatus === `` &&
                    telephone === `` &&
                    address === `` &&
                    emergencyName === `` &&
                    emergencyNumber === `` &&
                    startDate === null &&
                    eduLevel === `` &&
                    eduName === `` &&
                    eduGraduated === `` &&
                    eduCountry === `` &&
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
                    decoration === `` &&
                    percentSalary === `` &&
                    scoreKPI === `` &&
                    scoreCompetence === `` &&
                    statusDisability === ``
                  }
                >
                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: 5 }} />
                  ล้าง
                </Button>
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
