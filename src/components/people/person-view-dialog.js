import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import renderDivision from "../../functions/render-division"
import renderTableDate from "../../functions/render-table-date"
import renderAgeFromDifferentDateRange from "../../functions/render-age-from-different-date-range"
import renderFullname from "../../functions/render-fullname"

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: var(--main-font-family);

  > p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const Line = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.27);
  border-radius: 8px;
  padding: 0.5rem 1rem;
`
const Label = styled.span`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
`

const PersonViewDialog = ({ personId, open, title, callback }) => {
  const { token } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()
  const [data, setData] = useState(null)
  const [progressStatus, setProgressStatus] = useState({
    status: ``,
    text: ``,
  })

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

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

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

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, personId, dispatch])

  const closeModal = () => {
    callback()

    setTimeout(() => {
      setData(null)
    }, 200)
  }

  useEffect(() => {
    if (open) {
      getPerson()
    }
  }, [open, getPerson])

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
        <DialogContent dividers>
          <Content>
            {data !== null && progressStatus.status === `` && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Line>
                      <Label>ชื่อ</Label>
                      <span>
                        {renderFullname({
                          rank: data.person.Prename,
                          name: data.person.Name,
                          surname: data.person.Surname,
                        })}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>หมายเลขประจำตัวประชาชน</Label>
                      <span>{data.person.ID_Card || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>หมายเลขประจำตัวข้าราชการกองทัพบก</Label>
                      <span>{data.person.SID_Card || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>ประเภท</Label>
                      <span>{data.person.type || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>ชื่อตำแหน่งในสายงาน</Label>
                      <span>
                        {data.position.position_type !== null
                          ? data.position.position_type.name
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>ชื่อประเภทกลุ่มงาน</Label>
                      <span>
                        {data.position.position_type !== null
                          ? data.position.position_type.type
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>เลขที่ตำแหน่ง</Label>
                      <span>{data.position.number || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>สังกัด</Label>
                      <span>
                        {renderDivision(data.position.division) || `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>วันเดือนปีเกิด</Label>
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
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>เพศ</Label>
                      <span>{data.person.Gender || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>สถานภาพสมรส</Label>
                      <span>{data.person.MarriedStatus || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>หมายเลขโทรศัพท์</Label>
                      <span>{data.person.Telephone || `-`}</span>
                    </Line>
                  </Grid>
                </Grid>
                <Divider
                  style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
                />
                <Grid container spacing={2}>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>จังหวัด</Label>
                      <span>
                        {data.person.location !== null
                          ? data.person.location.province
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>อำเภอ</Label>
                      <span>
                        {data.person.location !== null
                          ? data.person.location.district
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>ตำบล</Label>
                      <span>
                        {data.person.location !== null
                          ? data.person.location.subdistrict
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Line>
                      <Label>รหัสไปรษณีย์</Label>
                      <span>
                        {data.person.location !== null
                          ? data.person.location.zipcode
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item xs={12}>
                    <Line>
                      <Label>รายละเอียดที่อยู่</Label>
                      <span>{data.person.Address || `-`}</span>
                    </Line>
                  </Grid>
                </Grid>
                <Divider
                  style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Line>
                      <Label>วันเริ่มทำสัญญา</Label>
                      <span>
                        {renderTableDate(data.person.StartDate, `full-date`) ||
                          `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <Line>
                      <Label>ระดับการศึกษา</Label>
                      <span>
                        {data.person.education_level !== null
                          ? data.person.education_level.name
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <Line>
                      <Label>ชื่อวุฒิการศึกษา</Label>
                      <span>
                        {data.person.education_name !== null
                          ? data.person.education_name.full_name
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <Line>
                      <Label>ชื่อสถาบันที่สำเร็จการศึกษา</Label>
                      <span>
                        {data.person.educational_institution !== null
                          ? data.person.educational_institution.name
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <Line>
                      <Label>ชื่อประเทศ</Label>
                      <span>
                        {data.person.country !== null
                          ? data.person.country.name
                          : `-`}
                      </span>
                    </Line>
                  </Grid>
                </Grid>
                <Divider
                  style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
                />
                <Grid container spacing={2}>
                  {data.person.type === `พนักงานราชการ` && (
                    <>
                      <Grid item sm={6} xs={12}>
                        <Line>
                          <Label>ชื่อประเภทการเคลื่อนไหวล่าสุด</Label>
                          <span>{data.person.MovementType || `-`}</span>
                        </Line>
                      </Grid>
                      <Grid item sm={6} xs={12}>
                        <Line>
                          <Label>กรอบอัตรากำลัง</Label>
                          <span>{data.person.Outline || `-`}</span>
                        </Line>
                      </Grid>
                    </>
                  )}
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>ค่าตอบแทนปัจจุบัน(เงินเดือน)</Label>
                      <span>{data.person.RewardType1 || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>ค่าตอบแทนสำหรับตำแหน่งที่มีเหตุพิเศษ</Label>
                      <span>{data.person.RewardType2 || `-`}</span>
                    </Line>
                  </Grid>
                  {data.person.type === `พนักงานราชการ` && (
                    <Grid item sm={4} xs={12}>
                      <Line>
                        <Label>ค่าครองชีพชั่วคราว</Label>
                        <span>{data.person.RewardType3 || `-`}</span>
                      </Line>
                    </Grid>
                  )}
                  {data.person.type === `พนักงานราชการ` && (
                    <Grid item sm={3} xs={12}>
                      <Line>
                        <Label>จำนวนครั้งที่ทำสัญญา</Label>
                        <span>{data.person.ContactCnt || `-`}</span>
                      </Line>
                    </Grid>
                  )}
                  <Grid
                    item
                    sm={data.person.type === `พนักงานราชการ` ? 3 : 4}
                    xs={12}
                  >
                    <Line>
                      <Label>ประเภทภารกิจ</Label>
                      <span>{data.person.Mission || `-`}</span>
                    </Line>
                  </Grid>
                  {data.person.type === `พนักงานราชการ` && (
                    <>
                      <Grid item sm={3} xs={12}>
                        <Line>
                          <Label>วันที่เริ่มสัญญาปัจจุบัน</Label>
                          <span>
                            {renderTableDate(
                              data.person.CurrentContactStart,
                              `full-date`
                            ) || `-`}
                          </span>
                        </Line>
                      </Grid>
                      <Grid item sm={3} xs={12}>
                        <Line>
                          <Label>วันที่สิ้นสุดสัญญาปัจจุบัน</Label>
                          <span>
                            {renderTableDate(
                              data.person.CurrentContactEnd,
                              `full-date`
                            ) || `-`}
                          </span>
                        </Line>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Divider
                  style={{ margin: `2rem auto`, width: 360, maxWidth: `100%` }}
                />
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <Line>
                      <Label>ความผิดทางวินัย</Label>
                      <span>{data.person.Guilty || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <Line>
                      <Label>ประเภทโทษทางวินัย</Label>
                      <span>{data.person.Punish || `-`}</span>
                    </Line>
                  </Grid>
                  {data.person.type === `ลูกจ้างประจำ` && (
                    <Grid item xs={12}>
                      <Line>
                        <Label>เครื่องราชอิสริยาภรณ์สูงสุดที่ได้รับ</Label>
                        <span>
                          {data.person.decoration !== null
                            ? data.person.decoration.full_name
                            : `-`}
                        </span>
                      </Line>
                    </Grid>
                  )}
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>ร้อยละที่ได้รับการเลื่อนเงินเดือน</Label>
                      <span>{data.person.PercentSalary || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>คะแนนผลสัมฤทธิ์ของงาน</Label>
                      <span>{data.person.ScoreKPI || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <Line>
                      <Label>คะแนนประเมินสมรรถนะ</Label>
                      <span>{data.person.ScoreCompetence || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item xs={12}>
                    <Line>
                      <Label>สภานภาพทางกาย</Label>
                      <span>{data.person.StatusDisability || `-`}</span>
                    </Line>
                  </Grid>
                  <Grid item xs={12}>
                    <Line>
                      <Label>ทักษะประสบการณ์</Label>
                      <span>{data.person.skills || `-`}</span>
                    </Line>
                  </Grid>
                </Grid>
              </>
            )}
            {progressStatus.status === `loading` && (
              <div
                style={{
                  display: `flex`,
                  alignItems: `center`,
                  justifyContent: `center`,
                  flexDirection: `column`,
                  padding: `2rem`,
                }}
              >
                <CircularProgress color="primary" size="5rem" thickness={5} />
              </div>
            )}
          </Content>
        </DialogContent>
        <DialogActions sx={{ position: `absolute`, top: 0, right: 0 }}>
          <IconButton
            style={{ width: 40, height: 40 }}
            onClick={() => closeModal()}
          >
            <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20 }} />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

PersonViewDialog.propTypes = {
  personId: PropTypes.string,
  open: PropTypes.bool,
  title: PropTypes.string,
  callback: PropTypes.func,
}

PersonViewDialog.defaultProps = {
  personId: ``,
  open: false,
  title: `ดูประวัติกำลังพล`,
  callback: () => {},
}

export default PersonViewDialog