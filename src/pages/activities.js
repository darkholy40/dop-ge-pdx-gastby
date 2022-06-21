import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Pagination,
  Button,
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircle,
  faEye,
  faPlay,
  faRedo,
} from "@fortawesome/free-solid-svg-icons"
import { green, grey, blue, red } from "@mui/material/colors"

import { client, gql } from "../functions/apollo-client"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import PageNotFound from "../components/page-not-found"
import Warning from "../components/warning"
import renderTableDate from "../functions/render-table-date"
import roles from "../static/roles"

const Oparator = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const Activities = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const dispatch = useDispatch()
  const [logsData, setLogsData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: 0,
    rowsPerPage: 10,
  })

  const getLogs = useCallback(async () => {
    let returnData = []

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const total = await client(token).query({
        query: gql`
          query LogsCount {
            logsConnection {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      setTableOption(prev => ({
        ...prev,
        totalRows: total.data.logsConnection.aggregate.count,
      }))

      if (total.data.logsConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Logs {
              logs(start: ${parseInt(
                tableOption.rowsPerPage * tableOption.page
              )}, limit: ${tableOption.rowsPerPage}, sort: "_id:desc") {
                _id
                action
                description
                users_permissions_user {
                  _id
                  name
                  surname
                  role {
                    name
                  }
                }
                createdAt
              }
            }
          `,
        })

        let count = 0
        for (let thisLog of res.data.logs) {
          count++
          returnData = [
            ...returnData,
            {
              orderNumber:
                count + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: thisLog._id,
              action: thisLog.action,
              description: thisLog.description,
              users_permissions_user: thisLog.users_permissions_user,
              created_at: thisLog.createdAt,
            },
          ]
        }

        if (returnData.length > 0) {
          setLogsData(returnData)
        } else {
          setIsError({
            status: true,
            text: `ไม่พบข้อมูล`,
          })
        }
      } else {
        setIsError({
          status: true,
          text: `ไม่พบข้อมูล`,
        })
      }
    } catch (error) {
      console.log(error.message)

      setIsError({
        status: true,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูล`,
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, dispatch, tableOption.page, tableOption.rowsPerPage])

  const renderAction = (action, description) => {
    switch (action) {
      case `auth`:
        switch (description) {
          case `login`:
            return (
              <>
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: green[500], marginRight: 8 }}
                />
                <span>{description}</span>
              </>
            )

          case `logout`:
            return (
              <>
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: grey[500], marginRight: 8 }}
                />
                <span>{description}</span>
              </>
            )

          default:
            return (
              <>
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: red[500], marginRight: 8 }}
                />
                <span>{description}</span>
              </>
            )
        }

      case `view`:
        return (
          <>
            <FontAwesomeIcon
              icon={faEye}
              style={{ color: grey[900], marginRight: 8 }}
            />
            <span>{description}</span>
          </>
        )

      case `action`:
        return (
          <>
            <FontAwesomeIcon
              icon={faPlay}
              style={{ color: blue[700], marginRight: 8 }}
            />
            <span>{description}</span>
          </>
        )

      default:
        return (
          <>
            {action}: {description}
          </>
        )
    }
  }

  useEffect(() => {
    if (token !== ``) {
      getLogs()
    }
  }, [getLogs, token])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `activities`,
    })
  }, [dispatch])

  return (
    <Layout>
      {token !== `` && roles[userInfo.role.name].level >= 3 ? (
        <>
          <Seo title="ประวัติการใช้งานระบบ" />
          <Breadcrumbs current="ประวัติการใช้งานระบบ" />

          {!isError.status ? (
            logsData.length > 0 && (
              <>
                <Oparator>
                  <Button
                    style={{
                      borderRadius: `100px`,
                    }}
                    color="primary"
                    variant="outlined"
                    onClick={() => getLogs()}
                  >
                    <FontAwesomeIcon icon={faRedo} style={{ fontSize: 16 }} />
                  </Button>
                </Oparator>
                <Pagination
                  sx={{
                    marginBottom: `1rem`,
                    ".MuiPagination-ul": {
                      justifyContent: `flex-end`,
                    },
                  }}
                  shape="rounded"
                  count={Math.ceil(
                    tableOption.totalRows / tableOption.rowsPerPage
                  )}
                  color="primary"
                  onChange={(_, newPage) => {
                    if (newPage !== null) {
                      setTableOption(prev => ({
                        ...prev,
                        page: newPage - 1,
                      }))
                    }
                  }}
                  page={tableOption.page + 1}
                />
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 300 }}
                    aria-label="pos table"
                    size="small"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: primaryColor[200] }}
                        >
                          ลำดับ
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ชื่อผู้ใช้งาน
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          การกระทำ
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: primaryColor[200] }}
                          align="right"
                        >
                          วันที่สร้าง
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logsData.map((row, rowIndex) => (
                        <TableRow
                          key={`${rowIndex}_${row._id}`}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": {
                              backgroundColor: primaryColor[50],
                            },
                          }}
                        >
                          <TableCell component="th" scope="row" align="center">
                            {row.orderNumber}
                          </TableCell>
                          <TableCell align="left">
                            {`${row.users_permissions_user.name} ${row.users_permissions_user.surname}`}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {renderAction(row.action, row.description)}
                          </TableCell>
                          <TableCell align="right">
                            <p style={{ margin: `0 0 0.25rem` }}>
                              {renderTableDate(row.created_at, `date`)}
                            </p>
                            <p style={{ margin: 0 }}>
                              {renderTableDate(row.created_at, `full-time`)}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={tableOption.totalRows}
                  rowsPerPage={tableOption.rowsPerPage}
                  labelRowsPerPage="แสดงแถวต่อหน้า:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} จาก ${
                      count !== -1 ? count : `มากกว่า ${to}`
                    }`
                  }
                  page={tableOption.page}
                  onPageChange={(_, newPage) => {
                    setTableOption(prev => ({
                      ...prev,
                      page: newPage,
                    }))
                  }}
                  onRowsPerPageChange={event => {
                    setTableOption(prev => ({
                      ...prev,
                      page: 0,
                      rowsPerPage: parseInt(event.target.value, 10),
                    }))
                  }}
                />
              </>
            )
          ) : (
            <>
              <Warning
                text={isError.text}
                variant={isError.text === `ไม่พบข้อมูล` ? `notfound` : ``}
                button={
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => window.location.reload()}
                  >
                    <FontAwesomeIcon icon={faRedo} style={{ marginRight: 5 }} />
                    <span>โหลดหน้านี้อีกครั้ง</span>
                  </Button>
                }
              />
            </>
          )}
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default Activities
