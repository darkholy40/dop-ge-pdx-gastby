import React, { useCallback, useEffect, useState } from "react"
import { navigate } from "gatsby"
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
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faEllipsisV,
  faCircle,
  faRedo,
  faCheckCircle,
  faEllipsisH,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons"
import { green, grey } from "@mui/material/colors"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import renderTableDate from "../../functions/render-table-date"
import renderUserRole from "../../functions/render-user-role"
import renderFullname from "../../functions/render-fullname"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const Oparator = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 1rem;
`

const UserManagementPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const dispatch = useDispatch()
  const [usersData, setUsersData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: 0,
    rowsPerPage: 10,
  })
  const [oparatorAnchorEl, setOparatorAnchorEl] = useState(null)
  const [optionAnchorEl, setOptionAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState(null)

  const savePageView = useCallback(() => {
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "users",
                users_permissions_user: "${userInfo._id}",
              }
            }) {
              log {
                _id
              }
            }
          }
        `,
      })
    }
  }, [token, userInfo])

  const getUsers = useCallback(async () => {
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
          query UsersCount {
            usersConnection {
              aggregate {
                count
              }
            }
          }
        `,
      })

      setTableOption(prev => ({
        ...prev,
        totalRows: total.data.usersConnection.aggregate.count,
      }))

      if (total.data.usersConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Users {
              users(
                start: ${parseInt(tableOption.rowsPerPage * tableOption.page)},
                limit: ${tableOption.rowsPerPage},
                where: {
                  _or: [
                    {
                      role: {
                        name: "Authenticated"
                      }
                    },
                    {
                      role: {
                        name: "Administrator"
                      }
                    },
                  ]
                }
              ) {
                _id
                username
                rank
                name
                surname
                userPosition
                confirmed
                blocked
                createdAt
                division {
                  _id
                  division1
                  division2
                  division3
                }
                role {
                  _id
                  name
                }
              }
            }
          `,
        })

        let count = 0
        for (let thisUser of res.data.users) {
          let totalAuthLogs = 0
          let theLastAuthLog = null

          const resTotalAuthLogs = await client(token).query({
            query: gql`
              query AuthLogsForUser {
                logsConnection(
                  where: {
                    users_permissions_user: "${thisUser._id}",
                    action: "auth"
                    _or: [
                      {
                        description: "login"
                      },
                      {
                        description: "logout"
                      }
                    ]
                  }
              ) {
                  aggregate {
                    count
                  }
                }
              }
            `,
          })
          totalAuthLogs = resTotalAuthLogs.data.logsConnection.aggregate.count

          if (totalAuthLogs > 0) {
            const resTheLastLog = await client(token).query({
              query: gql`
                query LastLog {
                  logs(
                    where: {
                      users_permissions_user:  "${thisUser._id}",
                      action: "auth"
                      _or: [
                        {
                          description: "login"
                        },
                        {
                          description: "logout"
                        }
                      ]
                    }, start: ${totalAuthLogs - 1}
                  ) {
                    _id
                    action
                    description
                    createdAt
                  }
                }
              `,
            })
            theLastAuthLog = resTheLastLog.data.logs[0]
          }

          count++
          returnData = [
            ...returnData,
            {
              orderNumber:
                count + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: thisUser._id,
              username: thisUser.username,
              rank: thisUser.rank,
              name: thisUser.name,
              surname: thisUser.surname,
              userPosition: thisUser.userPosition,
              confirmed: thisUser.confirmed,
              blocked: thisUser.blocked,
              division: thisUser.division,
              role: thisUser.role,
              status: theLastAuthLog,
            },
          ]
        }

        if (returnData.length > 0) {
          setUsersData(returnData)
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

  useEffect(() => {
    if (token !== ``) {
      getUsers()
    }
  }, [getUsers, token])

  const renderStatus = status => {
    switch (status) {
      case `login`:
        return (
          <>
            <FontAwesomeIcon
              icon={faCircle}
              style={{ color: green[500], marginRight: 8 }}
            />
            <span>{status}</span>
          </>
        )

      case `logout`:
        return (
          <>
            <FontAwesomeIcon
              icon={faCircle}
              style={{ color: grey[500], marginRight: 8 }}
            />
            <span>{status}</span>
          </>
        )

      default:
        return <>{status}</>
    }
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `users`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="ผู้ใช้งานระบบ" />
          <Breadcrumbs current="ผู้ใช้งานระบบ" />

          {!isError.status ? (
            usersData.length > 0 && (
              <>
                <Oparator>
                  <Button
                    style={{
                      marginRight: 8,
                    }}
                    color="success"
                    variant="outlined"
                    onClick={() => {
                      navigate(`/users/add/`)
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      style={{ marginRight: 5 }}
                    />
                    เพิ่มผู้ใช้งาน
                  </Button>
                  <IconButton
                    style={{
                      width: 37,
                      height: 37,
                    }}
                    color="inherit"
                    variant="outlined"
                    onClick={event => {
                      setOparatorAnchorEl(event.currentTarget)
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faEllipsisV}
                      style={{ fontSize: 16, color: `rgba(0, 0, 0, 0.54)` }}
                    />
                  </IconButton>
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
                          ยศ - ชื่อ - สกุล
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          สังกัด
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ตำแหน่ง
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ระดับผู้ใช้งาน
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: primaryColor[200] }}
                          align="center"
                        >
                          เปิดการเข้าใช้งาน
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          สถานะ
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: primaryColor[200] }}
                          align="right"
                        >
                          วันที่
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: primaryColor[200] }}
                        ></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersData.map((row, rowIndex) => (
                        <TableRow
                          key={`${rowIndex}_${row._id}`}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": {
                              backgroundColor: primaryColor[50],
                            },
                            height: `57px`,
                          }}
                        >
                          <TableCell component="th" scope="row" align="center">
                            {row.orderNumber}
                          </TableCell>
                          <TableCell align="left">{row.username}</TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {renderFullname(row)}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {renderDivision(row.division)}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.userPosition || `-`}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.role !== null
                              ? renderUserRole(row.role.name)
                              : `-`}
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: 100 }}>
                            {row.confirmed && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{
                                  fontSize: 20,
                                  color: green[500],
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.status !== null &&
                              renderStatus(row.status.description)}
                          </TableCell>
                          <TableCell align="right">
                            {row.status !== null && (
                              <>
                                <p style={{ margin: `0 0 0.25rem` }}>
                                  {renderTableDate(
                                    row.status.createdAt,
                                    `date`
                                  )}
                                </p>
                                <p style={{ margin: 0 }}>
                                  {renderTableDate(
                                    row.status.createdAt,
                                    `full-time`
                                  )}
                                </p>
                              </>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={event => {
                                setOptionAnchorEl(event.currentTarget)
                                setCurrentRow(row)
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisH}
                                style={{ fontSize: 16 }}
                              />
                            </IconButton>
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

                <Menu
                  sx={{
                    ".MuiList-root.MuiList-padding.MuiMenu-list": {
                      minWidth: 180,
                    },
                  }}
                  anchorEl={oparatorAnchorEl}
                  open={Boolean(oparatorAnchorEl)}
                  onClose={() => {
                    setOparatorAnchorEl(null)
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setOparatorAnchorEl(null)
                      getUsers()
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon icon={faRedo} style={{ marginRight: 5 }} />
                    โหลดข้อมูลใหม่
                  </MenuItem>
                </Menu>

                <Menu
                  sx={{
                    ".MuiList-root.MuiList-padding.MuiMenu-list": {
                      minWidth: 180,
                    },
                  }}
                  anchorEl={optionAnchorEl}
                  open={Boolean(optionAnchorEl)}
                  onClose={() => {
                    setOptionAnchorEl(null)
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setOptionAnchorEl(null)
                      navigate(`/users/edit/?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon
                      icon={faUserEdit}
                      style={{ marginRight: 5 }}
                    />
                    แก้ไขข้อมูลผู้ใช้งาน
                  </MenuItem>
                </Menu>
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
                    onClick={() => getUsers()}
                  >
                    <FontAwesomeIcon icon={faRedo} style={{ marginRight: 5 }} />
                    <span>โหลดข้อมูลอีกครั้ง</span>
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

export default UserManagementPage
