import React, { useEffect, useState, useCallback } from "react"
import { navigate } from "gatsby"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  TextField,
  Autocomplete,
  Button,
  Collapse,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material"
import { green } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faRedoAlt,
  faSave,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../functions/apollo-client"

import { CheckCircleFlex, TextFieldDummy } from "./styles"
import Warning from "./warning"
import renderCheckingIcon from "../functions/render-checking-icon"
import uniqByKeepFirst from "../functions/uniq-by-keep-first"
import renderDivision from "../functions/render-division"

const Container = styled.div`
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  padding: 32px 24px;
  max-width: 800px;
  margin: auto;
`

const Flex = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1.25rem;
`

const Next = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  > p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const UnitSettingForm = ({ fullWidth, onFinish }) => {
  const stylesPayload = {
    style: {
      width: fullWidth ? `100%` : `auto`,
    },
  }
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { locations } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [isInputSelected, setIsInputSelected] = useState(false)
  const [data, setData] = useState(null)
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [inputs, setInputs] = useState({
    province: ``,
    organizeType: ``,
  })
  const [isDivisionDataUpdated, setIsDivisionDataUpdated] = useState(false)
  const [isDivisionOptionalDataIsExisted, setIsDivisionOptionalDataIsExisted] =
    useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const provinces = uniqByKeepFirst(locations, it => it.province)

  const getUserUnitData = useCallback(async () => {
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
          query User {
            user(id: "${userInfo._id}") {
              division {
                _id
                division1
                division2
                division3
                province
                organize_type
              }
            }
          } 
        `,
      })

      const userData = res.data.user

      if (userData !== null) {
        let returnData = {
          province: ``,
          organize_type: ``,
        }

        if (userData.division.province !== null) {
          returnData.province = userData.division.province
        }

        if (userData.division.organize_type !== null) {
          returnData.organize_type = userData.division.organize_type
        }

        setInputs(prev => ({
          ...prev,
          province: returnData.province,
          organizeType: returnData.organize_type,
        }))
        setData(userData)

        if (returnData.province !== `` && returnData.organize_type !== ``) {
          setIsDivisionOptionalDataIsExisted(true)

          if (fullWidth) {
            dispatch({
              type: `SET_TUTORIAL_COUNT`,
              tutorialCount: 4,
            })
            navigate(`/people/`)
          }
        }
      }
    } catch (error) {
      console.log({
        func: `settings/unit -> getUserUnitData()`,
        message: error.message,
      })

      setIsError({
        status: `connection`,
        text: `เชื่อมต่อฐานข้อมูลไม่สำเร็จ`,
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, userInfo._id, dispatch, fullWidth])

  const goSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const res = await client(token).mutate({
        mutation: gql`
          mutation UpdateDivision {
            updateDivision(input: {
              where: {
                id: "${data.division._id}"
              },
              data: {
                province: "${inputs.province}",
                organize_type: "${inputs.organizeType}",
              },
            }) {
              division {
                _id
              }
            }
          }
        `,
      })

      if (res) {
        setIsDivisionDataUpdated(true)

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "division->update => ${userInfo.division._id}",
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

        if (fullWidth) {
          setIsDivisionOptionalDataIsExisted(true)
        }
      }
    } catch (error) {
      console.log({
        func: `settings/unit -> goSave()`,
        message: error.message,
      })

      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การบันทึกข้อมูลไม่สำเร็จ`,
          description: `ไม่สามารถบันทึกข้อมูลได้`,
          variant: `error`,
          confirmText: `ลองอีกครั้ง`,
          onFinish: () => {},
        },
      })
    }

    setIsSaving(false)
  }

  useEffect(() => {
    getUserUnitData()
  }, [getUserUnitData])

  useEffect(() => {
    setIsDivisionDataUpdated(false)
  }, [inputs])

  const myForm = () => (
    <>
      <form
        onSubmit={e => {
          e.preventDefault()

          goSave()
        }}
      >
        <Flex
          style={{
            flexDirection: `column`,
            alignItems: `center`,
            width: `100%`,
            maxWidth: 480,
            margin: `0 auto`,
          }}
        >
          {/* <p style={{ width: `100%` }}>{renderDivision(userInfo.division)}</p> */}
          <TextFieldDummy.Line style={{ width: `100%`, marginBottom: `1rem` }}>
            <TextFieldDummy.Label>สังกัด</TextFieldDummy.Label>
            <span>{renderDivision(userInfo.division)}</span>
          </TextFieldDummy.Line>
          <Flex>
            <Autocomplete
              sx={{ width: `100%` }}
              id="province"
              options={(() => {
                let arr = []
                for (let province of provinces) {
                  arr = [...arr, province.province]
                }

                return arr
              })()}
              noOptionsText={`ไม่พบข้อมูล`}
              getOptionLabel={option => option}
              isOptionEqualToValue={(option, value) => {
                return option === value
              }}
              onChange={(_, newValue) => {
                setIsInputSelected(true)
                setInputs({
                  ...inputs,
                  province: newValue !== null ? newValue : ``,
                })
              }}
              value={inputs.province !== `` ? inputs.province : null}
              renderInput={params => (
                <TextField
                  {...params}
                  label="* จังหวัด"
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      borderRadius: `5px 0 0 5px`,
                    },
                  }}
                />
              )}
              disabled={isSaving}
            />
            <CheckCircleFlex>
              {renderCheckingIcon(inputs.province)}
            </CheckCircleFlex>
          </Flex>

          <Flex>
            <Autocomplete
              sx={{ width: `100%` }}
              id="organize-type"
              options={[`ส่วนกลาง`, `ส่วนภูมิภาค`]}
              noOptionsText={`ไม่พบข้อมูล`}
              getOptionLabel={option => option}
              isOptionEqualToValue={(option, value) => {
                return option === value
              }}
              onChange={(_, newValue) => {
                setIsInputSelected(true)
                setInputs({
                  ...inputs,
                  organizeType: newValue !== null ? newValue : ``,
                })
              }}
              value={inputs.organizeType !== `` ? inputs.organizeType : null}
              renderInput={params => (
                <TextField
                  {...params}
                  label="* สังกัดราชการส่วนกลาง/ส่วนภูมิภาค"
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      borderRadius: `5px 0 0 5px`,
                    },
                  }}
                />
              )}
              disabled={isSaving}
            />
            <CheckCircleFlex>
              {renderCheckingIcon(inputs.organizeType)}
            </CheckCircleFlex>
          </Flex>
          <Button
            fullWidth
            color="success"
            variant="contained"
            type="submit"
            disabled={
              inputs.province === `` ||
              inputs.organizeType === `` ||
              isDivisionDataUpdated ||
              isSaving ||
              !isInputSelected
            }
          >
            <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
            {!isDivisionDataUpdated ? `บันทึก` : `บันทึกแล้ว`}
          </Button>
          <Collapse in={isSaving}>
            <div
              style={{
                display: `flex`,
                justifyContent: `center`,
                alignItems: `center`,
                marginTop: `1rem`,
              }}
            >
              <CircularProgress
                color="primary"
                size="3rem"
                thickness={5}
                style={{ marginRight: 8 }}
              />
              <span>กำลังบันทึก...</span>
            </div>
          </Collapse>
        </Flex>
      </form>
    </>
  )

  return !fullWidth ? (
    <>
      {data !== null ? (
        <>
          <Collapse in={isDivisionDataUpdated}>
            <div
              style={{
                width: `100%`,
                maxWidth: `800px`,
                marginLeft: `auto`,
                marginRight: `auto`,
              }}
            >
              <Alert
                variant="outlined"
                color="success"
                sx={{ marginBottom: `1rem` }}
              >
                บันทึกข้อมูลสำเร็จ
              </Alert>
            </div>
          </Collapse>
          <Container>{myForm()}</Container>
        </>
      ) : (
        <>
          {isError.status === `connection` && (
            <Warning
              text={isError.text}
              variant="error"
              button={
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => getUserUnitData()}
                >
                  <FontAwesomeIcon
                    icon={faRedoAlt}
                    style={{ marginRight: 5 }}
                  />
                  <span>โหลดข้อมูลอีกครั้ง</span>
                </Button>
              }
            />
          )}
        </>
      )}
    </>
  ) : (
    <>
      {data !== null ? (
        <div {...stylesPayload}>
          {!isDivisionOptionalDataIsExisted ? (
            <>
              <Divider
                style={{
                  width: `100%`,
                  marginBottom: `2rem`,
                  maxWidth: `480px`,
                  marginLeft: `auto`,
                  marginRight: `auto`,
                }}
              >
                กรุณาระบุข้อมูลสังกัด
              </Divider>
              {myForm()}
            </>
          ) : (
            <Next>
              <p style={{ fontSize: `1.25rem` }}>บันทึกข้อมูลสังกัดสำเร็จ</p>
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{
                  fontSize: `4rem`,
                  marginBottom: `1rem`,
                  color: green[500],
                }}
              />
              <p>กดปุ่ม "ตกลง" เพื่อไปยังหน้าประวัติกำลังพล</p>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  dispatch({
                    type: `SET_TUTORIAL_COUNT`,
                    tutorialCount: 4,
                  })
                  navigate(`/people/`)
                  onFinish()
                }}
              >
                ตกลง
              </Button>
            </Next>
          )}
        </div>
      ) : (
        <>
          <p style={{ fontSize: `1.25rem` }}>กำลังตรวจสอบข้อมูลสังกัด</p>
          <CircularProgress color="primary" size="5rem" thickness={5} />
        </>
      )}
    </>
  )
}

UnitSettingForm.propTypes = {
  fullWidth: PropTypes.bool,
  onFinish: PropTypes.func,
}

UnitSettingForm.defaultProps = {
  fullWidth: false,
  onFinish: () => {},
}

export default UnitSettingForm
