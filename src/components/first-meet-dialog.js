import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Dialog, Button } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { green as successColor } from "@mui/material/colors"

import UnitSettingForm from "./unit-setting-from"

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;

  > p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const FirstMeetDialog = () => {
  const dispatch = useDispatch()
  const { tutorialCount, userInfo } = useSelector(
    ({ mainReducer }) => mainReducer
  )

  const checkDivisionDetailIsComplete = () => {
    let isPassed = false

    if (userInfo.division !== null) {
      if (
        userInfo.division.organize_type !== null &&
        userInfo.division.organize_type !== undefined &&
        userInfo.division.organize_type !== `` &&
        userInfo.division.province !== null &&
        userInfo.division.province !== undefined &&
        userInfo.division.province !== ``
      ) {
        isPassed = true
      }
    }

    return isPassed
  }

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={tutorialCount === 2}>
        <Content>
          <p style={{ fontSize: `1.25rem` }}>การดาวน์โหลดข้อมูลสำเร็จ</p>
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: successColor[500],
            }}
          />
          <p>
            {checkDivisionDetailIsComplete()
              ? `กดปุ่ม "ตกลง" เพื่อไปยังหน้าประวัติกำลังพล`
              : `กดปุ่ม "ตกลง" เพื่อไปยังขั้นตอนถัดไป`}
          </p>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              dispatch({
                type: `SET_TUTORIAL_COUNT`,
                tutorialCount: checkDivisionDetailIsComplete() ? 4 : 3,
              })
            }}
          >
            ตกลง
          </Button>
        </Content>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" open={tutorialCount === 3}>
        <Content style={{ overflowY: `hidden` }}>
          <UnitSettingForm fullWidth />
        </Content>
      </Dialog>
    </>
  )
}

export default FirstMeetDialog
