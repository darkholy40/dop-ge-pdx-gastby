import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useDispatch } from "react-redux"
import { Button } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile, faChevronLeft } from "@fortawesome/free-solid-svg-icons"

import Seo from "../components/Seo"

const Flex = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`

const Title = styled.p`
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`

const Desc = styled.p`
  margin-top: 0;
  margin-bottom: 1rem;
`

const PageNotFound = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `404`,
    })
  }, [dispatch])

  return (
    <>
      <Seo title="ไม่พบหน้านี้" />

      <Flex>
        <FontAwesomeIcon
          icon={faFile}
          style={{ fontSize: 75, color: `rgba(0, 0, 0, 0.8)` }}
        />
        <Title>ไม่พบหน้านี้</Title>
        <Desc>
          ไม่พบ url
          ที่เรียกหรือต้องทำการลงชื่อเข้าใช้งานระบบก่อนใช้งานเนื้อหาในส่วนนี้
        </Desc>
        <Button
          color="primary"
          variant="outlined"
          onClick={() => navigate(`/`)}
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ marginRight: 5 }} />
          <span>กลับหน้าแรก</span>
        </Button>
      </Flex>
    </>
  )
}

export default PageNotFound
