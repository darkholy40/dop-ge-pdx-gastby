import React, { useEffect, useCallback, useState } from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import PageNotFound from "../../components/PageNotFound"
import Warning from "../../components/Warning"

const PositionsPage = () => {
  const { token, url, primaryColor } = useSelector(state => state)
  const dispatch = useDispatch()
  const [posData, setPosData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })

  const getPosition = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client.query({
        query: gql`
          query Position {
            positions {
              _id
              Pos_Name
              Pos_type
              Pos_Number
              Pos_Open
              Pos_South
              published_at
              createdAt
              updatedAt
            }
          }
        `,
      })

      console.log(res.data)

      if (res.data.positions.length > 0) {
        setPosData(res.data.positions)
      } else {
        setIsError({
          status: true,
          text: `ไม่พบข้อมูล`,
        })
      }
    } catch (error) {
      console.log(error)

      setIsError({
        status: true,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูล`,
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }, [url, dispatch])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  useEffect(() => {
    if (token !== ``) {
      getPosition()
    }
  }, [getPosition, token])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="ต้นหาคลังตำแหน่ง" />

          <Button
            style={{ marginBottom: `1rem` }}
            color="primary"
            variant="contained"
            onClick={() => navigate(`/positions`)}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
            คลังตำแหน่ง
          </Button>

          {!isError.status ? (
            posData.length > 0 && (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 300 }} aria-label="pos table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: primaryColor[200] }}
                      >
                        ลำดับ
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: primaryColor[200] }}
                      >
                        ตำแหน่ง
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: primaryColor[200] }}
                      >
                        กลุ่มงาน
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: primaryColor[200] }}
                      >
                        เลขที่ตำแหน่ง
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: primaryColor[200] }}
                      >
                        ชื่อ สกุล (ผู้ครองตำแหน่ง)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: primaryColor[200] }}
                      >
                        อัตรากำลังจังหวัดชายแดนภาคใต้
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {posData.map((row, rowIndex) => (
                      <TableRow
                        key={`${rowIndex}_${row._id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row" align="center">
                          {rowIndex + 1}
                        </TableCell>
                        <TableCell align="left" sx={{ minWidth: 100 }}>
                          {row.Pos_Name}
                        </TableCell>
                        <TableCell align="left">{row.Pos_type}</TableCell>
                        <TableCell align="left">{row.Pos_Number}</TableCell>
                        <TableCell align="left"></TableCell>
                        <TableCell align="left">{row.Pos_South}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : (
            <Warning text={isError.text} />
          )}
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default PositionsPage
