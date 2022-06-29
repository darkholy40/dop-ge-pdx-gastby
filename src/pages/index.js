import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { CircularProgress, Divider } from "@mui/material"
import { grey, amber } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Login from "../components/login"
import SystemData from "../components/system-data"

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;

  p.th {
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  p.en {
    font-size: 1rem;
    margin-top: 0;
    margin-bottom: 1rem;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;

  p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const IndexPage = () => {
  const { token, userInfo, tutorialCount } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `home`,
    })
  }, [dispatch])

  useEffect(() => {
    const goNavigate = async () => {
      if (token !== ``) {
        if (tutorialCount === 4) {
          await navigate(`/people/`)
        }
      } else {
        await navigate(`/`)
      }
    }

    goNavigate()
  }, [token, userInfo, tutorialCount, dispatch])

  return (
    <Layout>
      {token === `` ? (
        <>
          <Seo title="ลงชื่อเข้าใช้งานระบบ" />
          <Login />
        </>
      ) : (
        <>
          <Seo
            title={
              tutorialCount < 4
                ? `ยินดีต้อนรับเข้าสู่ระบบพนักงานราชการและลูกจ้าง`
                : `ระบบกำลังนำท่านไปยังหน้าประวัติกำลังพล`
            }
          />
          <Container>
            {tutorialCount < 4 ? (
              <>
                <Flex>
                  <p className="th">
                    ยินดีต้อนรับเข้าสู่ระบบพนักงานราชการและลูกจ้าง
                  </p>
                  <p className="en">
                    Government Employee Personal Data Exchange (GE-PDX)
                  </p>
                </Flex>
                <Divider
                  style={{
                    margin: `0 auto 1rem auto`,
                    maxWidth: 360,
                    width: `calc(100%)`,
                  }}
                />
                <Content>
                  <p>
                    <span
                      style={{ backgroundColor: amber[100], borderRadius: 4 }}
                    >
                      สำหรับการเข้าใช้งานครั้งแรก
                    </span>
                    จำเป็นต้องดาวน์โหลดข้อมูลพื้นฐานของระบบไปยังเว็บบราวเซอร์ของท่าน
                  </p>
                  <p>กรุณากดปุ่ม "ดำเนินการต่อ" เพื่อดาวน์โหลดข้อมูล</p>
                  <SystemData
                    confirmButtonContent={
                      <>
                        <span>ดำเนินการต่อ</span>
                        <FontAwesomeIcon
                          icon={faLongArrowAltRight}
                          style={{ marginLeft: 5, fontSize: `1.25rem` }}
                        />
                      </>
                    }
                    confirmCallback={() => {
                      dispatch({
                        type: `SET_TUTORIAL_COUNT`,
                        tutorialCount: 1,
                      })
                    }}
                  />
                </Content>
              </>
            ) : (
              <>
                <CircularProgress color="primary" size="5rem" thickness={5} />
                <p style={{ color: grey[700] }}>
                  ระบบกำลังนำท่านไปยังหน้าประวัติกำลังพล
                </p>
              </>
            )}
          </Container>
        </>
      )}
    </Layout>
  )
}

export default IndexPage
