import React, { useEffect } from "react"
import { navigate } from "gatsby"
import PropTypes from "prop-types"
import { useDispatch } from "react-redux"
import { Button } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile, faChevronLeft } from "@fortawesome/free-solid-svg-icons"

import Seo from "../components/seo"

const Flex = styled.div`
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

const PageNotFound = ({ title, desc, link, buttonText }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `404`,
    })
  }, [dispatch])

  return (
    <>
      <Seo title={title} />

      <Flex>
        <FontAwesomeIcon
          icon={faFile}
          style={{ fontSize: 75, color: `rgba(0, 0, 0, 0.8)` }}
        />
        <Title>{title}</Title>
        <Desc>{desc}</Desc>
        <Button
          color="primary"
          variant="outlined"
          onClick={() => navigate(link)}
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ marginRight: 5 }} />
          <span>{buttonText}</span>
        </Button>
      </Flex>
    </>
  )
}

PageNotFound.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  link: PropTypes.string,
  buttonText: PropTypes.string,
}

PageNotFound.defaultProps = {
  title: `ไม่พบหน้านี้`,
  desc: `ไม่พบ url ที่ท่านเรียกหรือต้องทำการลงชื่อเข้าใช้งานระบบก่อนเข้าใช้งานเนื้อหาในส่วนนี้`,
  link: `/`,
  buttonText: `กลับหน้าแรก`,
}

export default PageNotFound
