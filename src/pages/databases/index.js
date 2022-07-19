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
    name: `ระดับการศึกษา`,
    icon: faUserGraduate,
  },
  {
    link: `/databases/education-names/`,
    name: `วุฒิการศึกษา`,
    icon: faGraduationCap,
  },
  {
    link: `/databases/educational-institutions/`,
    name: `สถาบันการศึกษา`,
    icon: faSchool,
  },
  {
    link: `/databases/countries/`,
    name: `รายชื่อประเทศ`,
    icon: faFlag,
  },
  {
    link: `/databases/decorations/`,
    name: `เครื่องราชอิสริยาภรณ์`,
    icon: faMedal,
  },
]

const DatabasesIndex = () => {
  const { token, primaryColor, userInfo } = useSelector(
    ({ mainReducer }) => mainReducer
  )
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
              return (
                <ColorButton
                  key={`button_${i}`}
                  primaryColor={primaryColor}
                  width="800px"
                  height="75px"
                >
                  <div className="row">
                    <div role="presentation" onClick={() => navigate(d.link)}>
                      <FontAwesomeIcon
                        icon={d.icon}
                        style={{
                          fontSize: `1.5rem`,
                          marginRight: 8,
                          minWidth: 35,
                        }}
                      />
                      <span>{d.name}</span>
                    </div>
                  </div>
                </ColorButton>
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
