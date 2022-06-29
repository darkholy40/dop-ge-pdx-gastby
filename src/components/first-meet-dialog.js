import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import { Dialog, Button } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { green as successColor } from "@mui/material/colors"

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;
  font-family: var(--main-font-family);

  > p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const FirstMeetDialog = () => {
  const dispatch = useDispatch()
  const { tutorialCount } = useSelector(({ mainReducer }) => mainReducer)

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
