import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import PageNotFound from "../components/PageNotFound"
import renderDivision from "../functions/renderDivision"

const Container = styled.div`
  // border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  padding: 16px 24px;
  width: 100%;
  max-width: 800px;
  margin: auto;
`

const Flex = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1.25rem;
`

const Left = styled.div`
  width: 100%;
  max-width: 300px;

  p {
    text-align: right;
    margin: 0;
    font-weight: bold;
    font-style: italic;
  }
`

const Right = styled.div`
  width: 100%;
  margin-left: 1.5rem;

  p {
    word-break: break-word;
    margin: 0;
  }
`

const SettingPage = () => {
  const { token, userInfo, sessionTimer } = useSelector(state => state)
  const dispatch = useDispatch()
  const [rows, setRows] = useState([])

  const renderRole = getRole => {
    switch (getRole) {
      case `Administrator`:
        return `ผู้ดูแลระบบ (ส่วนกลาง)`

      case `Authenticated`:
        return `ผู้ใช้งาน (ระดับหน่วย)`

      default:
        return ``
    }
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `setting`,
    })
  }, [dispatch])

  useEffect(() => {
    // console.log(userInfo)

    let users = [
      {
        title: `ชื่อ - สกุล`,
        desc: `${userInfo.name} ${userInfo.surname}`,
      },
      {
        title: `ชื่อผู้ใช้`,
        desc: userInfo.username,
      },
      {
        title: `สังกัด`,
        desc:
          userInfo.division !== null ? renderDivision(userInfo.division) : `-`,
      },
      {
        title: `ระดับผู้ใช้งาน`,
        desc: renderRole(userInfo.role.name),
      },
      {
        title: `ระยะเวลาเซสชัน`,
        desc: `8 ชม. (คงเหลือ ${sessionTimer.hr}:${sessionTimer.min}:${sessionTimer.sec})`,
      },
    ]
    setRows(users)
  }, [userInfo, token, sessionTimer])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="ตั้งค่า" />
          <Breadcrumbs current="ตั้งค่า" />

          <Container>
            {rows.map(row => (
              <Flex key={row.title}>
                <Left>
                  <p>{row.title}</p>
                </Left>
                <Right>
                  <p>{row.desc}</p>
                </Right>
              </Flex>
            ))}
          </Container>
        </>
      ) : (
        <>
          <PageNotFound />
        </>
      )}
    </Layout>
  )
}

export default SettingPage
