import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import { ColorButton } from "../../components/Styles"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const IndexPage = () => {
  const { token, primaryColor, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `reports`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` && userInfo.role.name === `Administrator` ? (
        <>
          <Seo title="ออกรายงาน" />
          <Breadcrumbs current="ออกรายงาน" />

          <Container>
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
            >
              <div className="row">
                <div
                  role="presentation"
                  onClick={() => navigate(`/reports/stock`)}
                >
                  รายชื่อพนักงานราชการและตำแหน่งว่าง (Stock)
                </div>
              </div>
            </ColorButton>
            <ColorButton
              primaryColor={primaryColor}
              width="800px"
              height="75px"
            >
              <div className="row">
                <div
                  role="presentation"
                  onClick={() => navigate(`/reports/flow-out`)}
                >
                  รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)
                </div>
              </div>
            </ColorButton>
          </Container>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default IndexPage
