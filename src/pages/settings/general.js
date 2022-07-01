import React, { useEffect, useState, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import jwt_decode from "jwt-decode"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import renderDivision from "../../functions/render-division"
import renderUserRole from "../../functions/render-user-role"
import roles from "../../static/roles"

const Container = styled.div`
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  padding: 16px 24px;
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

const SettingsGeneral = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { sessionTimer } = useSelector(({ timerReducer }) => timerReducer)
  const dispatch = useDispatch()
  const [rows, setRows] = useState([])

  const savePageView = useCallback(() => {
    if (
      token !== `` &&
      userInfo._id !== `` &&
      roles[userInfo.role.name].level < 3
    ) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "settings -> general",
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
    }
  }, [token, userInfo])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `settings-general`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (token !== ``) {
      // console.log(userInfo)
      const decodedToken = jwt_decode(token)
      const maxTimer = (decodedToken.exp - decodedToken.iat) / 3600

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
            userInfo.division !== null
              ? renderDivision(userInfo.division)
              : `-`,
        },
        {
          title: `ระดับผู้ใช้งาน`,
          desc: renderUserRole(userInfo.role.name),
        },
        {
          title: `ระยะเวลาเซสชัน`,
          desc: `${maxTimer} ชม. (คงเหลือ ${sessionTimer.hr}:${sessionTimer.min}:${sessionTimer.sec})`,
        },
        {
          title: `Token`,
          desc: token,
        },
      ]
      setRows(users)
    }
  }, [userInfo, token, sessionTimer])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 1 ? (
        <>
          <Seo title="การตั้งค่า" />
          <Breadcrumbs
            previous={[
              {
                name: `การตั้งค่า`,
                link: `/settings/`,
              },
            ]}
            current="บัญชีผู้ใช้งาน"
          />

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

export default SettingsGeneral
