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

// const flowOut = [
//   {
//     ชื่อกระทรวง: "",
//     ชื่อกรม: "",
//     "ชื่อสำนัก/กอง": "",
//     เลขที่ตำแหน่ง: "",
//     ชื่อตำแหน่งในสายงาน: "",
//     ชื่อประเภทกลุ่มงาน: "",
//     "สังกัดราชการส่วนกลาง/ส่วนภูมิภาค": "",
//     ชื่อจังหวัด: "",
//     "ชื่อคำนำหน้าชื่อ ": "",
//     ชื่อผู้ครองตำแหน่ง: "",
//     นามสกุลผู้ครองตำแหน่ง: "",
//     เลขประจำตัวประชาชน: "",
//     เพศ: "",
//     จำนวนครั้งที่ทำสัญญา: "",
//     ประเภทภารกิจ: "",
//     สาเหตุการออก: "",
//   },
// ]

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
            current="รายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)"
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
