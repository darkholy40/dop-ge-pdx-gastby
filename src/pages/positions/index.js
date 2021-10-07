import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { Button, TextField } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlusCircle, faSearch } from "@fortawesome/free-solid-svg-icons"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"

const Oparator = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
`

const PositionsPage = () => {
  const { token, searchFilter } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== "" ? (
        <>
          <Seo title="คลังตำแหน่ง" />
          <Breadcrumbs current="คลังตำแหน่ง" />

          <Oparator>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                dispatch({
                  type: `SET_ADD_POSITION_FILTER`,
                  addPositionFilter: {
                    posName: ``,
                    posType: ``,
                    posNumber: ``,
                    posOpen: false,
                    posSouth: false,
                  },
                })

                navigate(`/positions/add`)
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: 5 }} />
              เพิ่มคลังตำแหน่ง
            </Button>
          </Oparator>
          <Form>
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="pos-name"
              label="ชื่อตำแหน่ง"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_FILTER`,
                  searchFilter: {
                    ...searchFilter,
                    posName: e.target.value,
                  },
                })
              }}
              value={searchFilter.posName}
            />
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="pos-type"
              label="ชื่อประเภทกลุ่มงาน"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_FILTER`,
                  searchFilter: {
                    ...searchFilter,
                    posType: e.target.value,
                  },
                })
              }}
              value={searchFilter.posType}
            />
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="pos-number"
              label="เลขที่ตำแหน่ง"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_FILTER`,
                  searchFilter: {
                    ...searchFilter,
                    posNumber: e.target.value,
                  },
                })
              }}
              value={searchFilter.posNumber}
            />
            <Button
              color="primary"
              variant="contained"
              onClick={() => navigate(`/positions/list`)}
            >
              <FontAwesomeIcon icon={faSearch} style={{ marginRight: 5 }} />
              ค้นหา
            </Button>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
