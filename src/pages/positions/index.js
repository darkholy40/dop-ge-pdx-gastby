import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Button,
  TextField
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlusCircle, faSearch } from "@fortawesome/free-solid-svg-icons"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"

const Oparator = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  margin-bottom: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
`

const PositionsPage = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  return (
    <Layout>
      <Seo title="คลังตำแหน่ง" />

      <Oparator>
        <Button color="primary" variant="contained" onClick={() => navigate("/positions/add")}>
          <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
          เพิ่มคลังตำแหน่ง
        </Button>
      </Oparator>
      <Form>
        <TextField sx={{ marginBottom: "1rem" }} id="pos-name" label="ชื่อตำแหน่ง" variant="outlined" />
        <TextField sx={{ marginBottom: "1rem" }} id="pos-type" label="ชื่อประเภทกลุ่มงาน" variant="outlined" />
        <TextField sx={{ marginBottom: "1rem" }} id="pos-number" label="เลขที่ตำแหน่ง" variant="outlined" />
        <Button color="primary" variant="contained">
          <FontAwesomeIcon icon={faSearch} style={{ marginRight: 5 }} />
          ค้นหา
        </Button>
      </Form>
    </Layout>
  )
}

export default PositionsPage
