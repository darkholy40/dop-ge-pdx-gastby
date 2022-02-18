import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  // TableHead,
  TableRow,
  Paper,
} from "@mui/material"

import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import PageNotFound from "../components/PageNotFound"

const AboutPage = () => {
  const { token, userInfo } = useSelector(state => state)
  const dispatch = useDispatch()
  const [rows, setRows] = useState([])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `setting`,
    })
  }, [dispatch])

  useEffect(() => {
    console.log(userInfo)

    let users = [
      {
        title: `ชื่อ`,
        desc: userInfo.name,
      },
      {
        title: `สกุล`,
        desc: userInfo.surname,
      },
      {
        title: `ชื่อผู้ใช้`,
        desc: userInfo.username,
      },
      {
        title: `Role`,
        desc: userInfo.role.name,
      },
      {
        title: `Token`,
        desc: token,
      },
    ]
    setRows(users)
  }, [userInfo, token])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="ตั้งค่า" />
          <Breadcrumbs current="ตั้งค่า" />

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 300 }} aria-label="setting table">
              {/* <TableHead>
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    ตั้งค่า
                  </TableCell>
                </TableRow>
              </TableHead> */}
              <TableBody>
                {rows.map(row => (
                  <TableRow
                    key={row.title}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ minWidth: 100 }}
                    >
                      {row.title}
                    </TableCell>
                    <TableCell align="left" sx={{ wordBreak: `break-word` }}>
                      {row.desc}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <>
          <PageNotFound />
        </>
      )}
    </Layout>
  )
}

export default AboutPage
