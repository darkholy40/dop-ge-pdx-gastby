import React, { useCallback, useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUserGraduate,
  faGraduationCap,
  faSchool,
  faFlag,
  faMedal,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import { ColorButton } from "../../components/styles"
import roleLevel from "../../functions/role-level"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const data = [
  {
    link: `/databases/education-levels/`,
    title: `ระดับการศึกษา`,
    icon: faUserGraduate,
  },
  {
    link: `/databases/education-names/`,
    title: `วุฒิการศึกษา`,
    icon: faGraduationCap,
  },
  {
    link: `/databases/educational-institutions/`,
    title: `สถาบันการศึกษา`,
    icon: faSchool,
  },
  {
    link: `/databases/countries/`,
    title: `รายชื่อประเทศ`,
    description: `ประเทศที่จบการศึกษา`,
    icon: faFlag,
  },
  {
    link: `/databases/decorations/`,
    title: `เครื่องราชอิสริยาภรณ์`,
    icon: faMedal,
  },
]

const DatabasesIndex = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "databases",
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
      currentPage: `databases`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="การจัดการฐานข้อมูล" />
          <Breadcrumbs current="การจัดการฐานข้อมูล" />

          <Container>
            {data.map((d, i) => {
              const description = d.description !== undefined && {
                description: d.description,
              }

              return (
                <ColorButton
                  key={`button_${i}`}
                  width="800px"
                  height="75px"
                  style={{ marginBottom: `1rem` }}
                  onClick={() => navigate(d.link)}
                  icon={<FontAwesomeIcon icon={d.icon} />}
                  title={d.title}
                  {...description}
                />
              )
            })}
          </Container>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default DatabasesIndex
