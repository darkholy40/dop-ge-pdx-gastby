import React, { useEffect } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import positionType from "../../positionType"

const Oparator = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
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

const SubmitButtonFlex = styled.div`
  display: flex;
  justify-content: space-between;
`

const PositionsPage = () => {
  const { token, searchPositionFilter } = useSelector(state => state)
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
              // variant="contained"
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
          <Form onSubmit={e => e.preventDefault()}>
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="pos-name"
              label="ชื่อตำแหน่ง"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_POSITION_FILTER`,
                  searchPositionFilter: {
                    ...searchPositionFilter,
                    posName: e.target.value,
                  },
                })
              }}
              value={searchPositionFilter.posName}
            />
            <FormControl fullWidth>
              <InputLabel id="pos-type-label-id">ชื่อประเภทกลุ่มงาน</InputLabel>
              <Select
                sx={{ marginBottom: `1rem` }}
                labelId="pos-type-label-id"
                id="pos-type"
                label="ชื่อประเภทกลุ่มงาน"
                onChange={e => {
                  dispatch({
                    type: `SET_SEARCH_POSITION_FILTER`,
                    searchPositionFilter: {
                      ...searchPositionFilter,
                      posType: e.target.value,
                    },
                  })
                }}
                value={searchPositionFilter.posType}
              >
                <MenuItem value="" selected>
                  ---
                </MenuItem>
                {positionType.map((item, index) => {
                  return (
                    <MenuItem key={`postype_${index}`} value={item}>
                      {item}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <TextField
              sx={{ marginBottom: `1rem` }}
              id="pos-number"
              label="เลขที่ตำแหน่ง"
              variant="outlined"
              onChange={e => {
                dispatch({
                  type: `SET_SEARCH_POSITION_FILTER`,
                  searchPositionFilter: {
                    ...searchPositionFilter,
                    posNumber: e.target.value,
                  },
                })
              }}
              value={searchPositionFilter.posNumber}
            />
            <SubmitButtonFlex>
              <Button
                style={{
                  width: `100%`,
                  marginRight: 10,
                }}
                color="primary"
                variant="contained"
                onClick={() => navigate(`/positions/list`)}
              >
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: 5 }} />
                ค้นหา
              </Button>
              <Button
                style={{
                  width: `100%`,
                }}
                color="error"
                type="reset"
                onClick={() => {
                  dispatch({
                    type: `SET_SEARCH_POSITION_FILTER`,
                    searchPositionFilter: {
                      posName: ``,
                      posType: ``,
                      posNumber: ``,
                    },
                  })
                }}
                disabled={
                  searchPositionFilter.posName === `` &&
                  searchPositionFilter.posType === `` &&
                  searchPositionFilter.posNumber === ``
                }
              >
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 5 }} />
                ล้าง
              </Button>
            </SubmitButtonFlex>
          </Form>
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
