import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import PageNotFound from "../components/PageNotFound"
import renderDivision from "../functions/renderDivision"

const Container = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.12);
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
  width: 45%;
  text-align: right;
`

const Right = styled.div`
  width: 55%;
  margin-left: 1.5rem;
  word-break: break-word;
`

const SettingPage = () => {
  const { token, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()
  const [rows, setRows] = useState([])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `setting`,
    })
  }, [dispatch])

  useEffect(() => {
    console.log(userInfo)

    let users = [
      {
        title: `ชื่อ`,
        desc: userInfo.name,
      },
      {
        title: `สกุล`,
        desc: userInfo.surname,
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
        title: `Role`,
        desc: userInfo.role.name,
      },
      {
        title: `Token`,
        desc: token,
      },
    ]
    setRows(users)
  }, [userInfo, token])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="ตั้งค่า" />
          <Breadcrumbs current="ตั้งค่า" />

          <Container>
            {rows.map(row => (
              <Flex key={row.title}>
                <Left>{row.title}</Left>
                <Right>{row.desc}</Right>
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
