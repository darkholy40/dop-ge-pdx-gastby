import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useDispatch } from "react-redux"
import {
    Button
  } from "@mui/material"
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"

const AddPositionsPage = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  return (
    <Layout>
      <Seo title="เพิ่มคลังตำแหน่ง" />

      <Button color="primary" variant="contained" onClick={() => navigate("/positions")}>
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
          คลังตำแหน่ง
        </Button>
    </Layout>
  )
}

export default AddPositionsPage
