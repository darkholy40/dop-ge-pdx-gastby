import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const IndexPage = () => {
  const { token } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `reports`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา" />
          <Breadcrumbs
            previous={[
              {
                name: `ออกรายงาน`,
                link: `/reports`,
              },
            ]}
            current="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา"
          />

          <Container></Container>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default IndexPage
