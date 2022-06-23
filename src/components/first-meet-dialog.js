import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Dialog, Button } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faDatabase } from "@fortawesome/free-solid-svg-icons"
import { grey as infoColor, green as successColor } from "@mui/material/colors"

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;

  p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const FirstMeetDialog = () => {
  const dispatch = useDispatch()
  const { tutorialCount, currentPage } = useSelector(
    ({ mainReducer }) => mainReducer
  )

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={tutorialCount === 1 && currentPage === `settings-system-data`}
      >
        <Content>
          <FontAwesomeIcon
            icon={faDatabase}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: infoColor[500],
            }}
          />
          <p>กรุณาติดตั้งฐานข้อมูลที่จำเป็นในการใช้งานระบบ</p>
          <p>กดปุ่ม "ตกลง" เพื่อดำเนินการต่อ</p>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              dispatch({
                type: `SET_TUTORIAL_COUNT`,
                tutorialCount: 2,
              })
            }}
          >
            ตกลง
          </Button>
        </Content>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={tutorialCount === 3 && currentPage === `settings-system-data`}
      >
        <Content>
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: successColor[500],
            }}
          />
          <p>การดำเนินการติดตั้งฐานข้อมูลสำเร็จ</p>
          <p>กดปุ่ม "ตกลง" เพื่อไปยังหน้าจัดการประวัติกำลังพล</p>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              dispatch({
                type: `SET_TUTORIAL_COUNT`,
                tutorialCount: 4,
              })
              navigate(`/people/`)
            }}
          >
            ตกลง
          </Button>
        </Content>
      </Dialog>
    </>
  )
}

export default FirstMeetDialog
