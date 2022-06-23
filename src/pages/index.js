import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, CircularProgress, Divider } from "@mui/material"
import { grey } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Login from "../components/login"

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 172px);
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
                : `ระบบกำลังนำท่านไปยังหน้าจัดการประวัติกำลังพล`
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
                    สำหรับการเข้าใช้งานครั้งแรก
                    จำเป็นจะต้องติดตั้งฐานข้อมูลที่จำเป็นในการใช้งานระบบ
                  </p>
                  <p>กรุณากดปุ่ม "ดำเนินการต่อ" เพื่อไปยังขั้นตอนถัดไป</p>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                      dispatch({
                        type: `SET_TUTORIAL_COUNT`,
                        tutorialCount: 1,
                      })
                      navigate(`/settings/system-data/`)
                    }}
                  >
                    ดำเนินการต่อ
                    <FontAwesomeIcon
                      icon={faLongArrowAltRight}
                      style={{ marginLeft: 5, fontSize: `1.25rem` }}
                    />
                  </Button>
                </Content>
              </>
            ) : (
              <>
                <CircularProgress color="primary" size="5rem" thickness={5} />
                <p style={{ color: grey[700] }}>
                  ระบบกำลังนำท่านไปยังหน้าจัดการประวัติกำลังพล
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
