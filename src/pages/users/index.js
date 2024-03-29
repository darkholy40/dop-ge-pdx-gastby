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
  Chip,
  Popover,
  Collapse,
  TextField,
  Divider,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faEllipsisV,
  faCircle,
  faStopwatch,
  faRedo,
  faCheckCircle,
  faEllipsisH,
  faUserEdit,
  faSearch,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { green, grey } from "@mui/material/colors"
import jwt_decode from "jwt-decode"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Link,
  FilterContent,
  OparatorFlex,
  Flex,
} from "../../components/styles"
import UserInfoDialog from "../../components/users/user-info-dialog"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import renderTableDate from "../../functions/render-table-date"
import renderUserRole from "../../functions/render-user-role"
import renderFullname from "../../functions/render-fullname"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const initialStates = {
  filterInputs: {
    rank: ``,
    firstName: ``,
    lastName: ``,
    username: ``,
    unit: null,
    role: null,
  },
}

const UserManagementPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { units, roles } = useSelector(({ staticReducer }) => staticReducer)
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
  const [userDetailOpen, setUserDetailOpen] = useState(false)
  const [filterOpenAnchorEl, setFilterOpenAnchorEl] = useState(null)
  const [filterInputs, setFilterInputs] = useState(initialStates.filterInputs)
  const [confirmedFilterInputs, setConfirmedFilterInputs] = useState(
    initialStates.filterInputs
  )
  const [firstStrike, setFirstStrike] = useState(false)

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
    let filters = ``

    setIsError({
      status: false,
      text: ``,
    })

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    if (confirmedFilterInputs.rank !== ``) {
      filters += `
        rank_contains: "${confirmedFilterInputs.rank}"
      `
    }

    if (confirmedFilterInputs.firstName !== ``) {
      filters += `
        name_contains: "${confirmedFilterInputs.firstName}"
      `
    }

    if (confirmedFilterInputs.lastName !== ``) {
      filters += `
        surname_contains: "${confirmedFilterInputs.lastName}"
      `
    }

    if (confirmedFilterInputs.username !== ``) {
      filters += `
        username_contains: "${confirmedFilterInputs.username}"
      `
    }

    if (confirmedFilterInputs.unit !== null) {
      filters += `
        division: "${confirmedFilterInputs.unit._id}"
      `
    }

    if (confirmedFilterInputs.role !== null) {
      filters += `
        role: "${confirmedFilterInputs.role._id}"
      `
    }

    try {
      const total = await client(token).query({
        query: gql`
          query UsersCount {
            usersConnection(
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
                ],
                ${filters !== `` ? `${filters}` : ``}
              }
            ) {
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
                  ],
                  ${filters !== `` ? `${filters}` : ``} 
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

        setUsersData(returnData)
        setFirstStrike(true)
      } else {
        setUsersData([])
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
  }, [
    token,
    dispatch,
    tableOption.page,
    tableOption.rowsPerPage,
    confirmedFilterInputs,
  ])

  const renderStatus = status => {
    const desc = status.description
    const decodedToken = jwt_decode(token)
    const maxTimer = (decodedToken.exp - decodedToken.iat) * 1000

    const now = new Date().valueOf()
    const expiredTime = new Date(status.createdAt).valueOf() + maxTimer

    switch (desc) {
      case `login`:
        if (now > expiredTime) {
          return (
            <>
              <FontAwesomeIcon
                icon={faStopwatch}
                style={{
                  color: grey[500],
                  marginRight: 8,
                  fontSize: `1.125rem`,
                }}
              />
              <span>{`เซสชันหมดอายุ`}</span>
            </>
          )
        }

        return (
          <>
            <FontAwesomeIcon
              icon={faCircle}
              style={{ color: green[500], marginRight: 8 }}
            />
            <span>{`กำลังเข้าใช้งาน`}</span>
          </>
        )

      case `logout`:
        return (
          <>
            <FontAwesomeIcon
              icon={faCircle}
              style={{ color: grey[500], marginRight: 8 }}
            />
            <span>{`ออกจากระบบแล้ว`}</span>
          </>
        )

      default:
        return <>{desc}</>
    }
  }

  const acceptFilters = () => {
    setTableOption(prev => ({
      ...prev,
      page: 0,
      rowsPerPage: 10,
    }))
    setFilterOpenAnchorEl(null)
    setFilterInputs({
      ...initialStates.filterInputs,
      rank: filterInputs.rank,
      firstName: filterInputs.firstName,
      lastName: filterInputs.lastName,
      username: filterInputs.username,
      unit: filterInputs.unit,
      role: filterInputs.role,
    })
    setConfirmedFilterInputs({
      ...initialStates.filterInputs,
      rank: filterInputs.rank,
      firstName: filterInputs.firstName,
      lastName: filterInputs.lastName,
      username: filterInputs.username,
      unit: filterInputs.unit,
      role: filterInputs.role,
    })
  }

  const removeOneFilter = key => {
    setTableOption(prev => ({
      ...prev,
      page: 0,
      rowsPerPage: 10,
    }))
    setFilterInputs(prev => ({
      ...prev,
      [key]: initialStates.filterInputs[key],
    }))
    setConfirmedFilterInputs(prev => ({
      ...prev,
      [key]: initialStates.filterInputs[key],
    }))
  }

  const removeFilters = () => {
    setTableOption(prev => ({
      ...prev,
      page: 0,
      rowsPerPage: 10,
    }))
    setFilterOpenAnchorEl(null)
    setFilterInputs(initialStates.filterInputs)
    setConfirmedFilterInputs(initialStates.filterInputs)
  }

  useEffect(() => {
    if (token !== ``) {
      getUsers()
    }
  }, [getUsers, token])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `users`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (Boolean(filterOpenAnchorEl)) {
      setFilterInputs(prev => ({
        ...prev,
        ...confirmedFilterInputs,
      }))
    }
  }, [filterOpenAnchorEl, confirmedFilterInputs])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="ผู้ใช้งาน" />
          <Breadcrumbs current="ผู้ใช้งาน" />

          {firstStrike && (
            <>
              <Popover
                sx={{
                  ".MuiPaper-root.MuiPaper-elevation": {
                    minWidth: 360,
                  },
                }}
                anchorEl={filterOpenAnchorEl}
                open={Boolean(filterOpenAnchorEl)}
                onClose={() => {
                  setFilterOpenAnchorEl(null)
                }}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <FilterContent>
                  <div className="title">
                    <p>ค้นหา</p>
                    <IconButton
                      sx={{ width: `35px`, height: `35px` }}
                      onClick={() => setFilterOpenAnchorEl(null)}
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        style={{ color: grey[500] }}
                      />
                    </IconButton>
                  </div>
                  <Divider sx={{ width: `100%` }} />
                  <div className="field">
                    <TextField
                      label="ยศ"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          rank: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.rank}
                    />
                    <TextField
                      label="ชื่อ"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.firstName}
                    />
                    <TextField
                      label="สกุล"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.lastName}
                    />
                    <TextField
                      label="ชื่อผู้ใช้งาน"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.username}
                    />
                    <Flex style={{ marginTop: `1rem` }}>
                      <Autocomplete
                        sx={{ width: `100%` }}
                        size="small"
                        options={units}
                        noOptionsText={`ไม่พบข้อมูล`}
                        getOptionLabel={option => renderDivision(option)}
                        isOptionEqualToValue={(option, value) => {
                          return option === value
                        }}
                        onChange={(_, newValue) => {
                          setFilterInputs(prev => ({
                            ...prev,
                            unit: newValue,
                          }))
                        }}
                        value={filterInputs.unit}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="สังกัด"
                            InputProps={{
                              ...params.InputProps,
                            }}
                          />
                        )}
                      />
                    </Flex>
                    <Flex style={{ marginTop: `1rem` }}>
                      <Autocomplete
                        sx={{ width: `100%` }}
                        size="small"
                        options={roles}
                        noOptionsText={`ไม่พบข้อมูล`}
                        getOptionLabel={option => renderUserRole(option.name)}
                        isOptionEqualToValue={(option, value) => {
                          return option === value
                        }}
                        onChange={(_, newValue) => {
                          setFilterInputs(prev => ({
                            ...prev,
                            role: newValue,
                          }))
                        }}
                        value={filterInputs.role}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="ระดับผู้ใช้งาน"
                            InputProps={{
                              ...params.InputProps,
                            }}
                          />
                        )}
                      />
                    </Flex>
                  </div>
                  <Divider sx={{ width: `100%` }} />
                  <div className="buttons">
                    <Button
                      sx={{ marginRight: `0.5rem` }}
                      color="error"
                      onClick={() => {
                        removeFilters()
                      }}
                      disabled={
                        confirmedFilterInputs.rank === `` &&
                        confirmedFilterInputs.firstName === `` &&
                        confirmedFilterInputs.lastName === `` &&
                        confirmedFilterInputs.username === `` &&
                        confirmedFilterInputs.unit === null &&
                        confirmedFilterInputs.role === null
                      }
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        style={{ marginRight: 5 }}
                      />
                      ล้างตัวกรอง
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        acceptFilters()
                      }}
                      disabled={
                        filterInputs.rank === `` &&
                        filterInputs.firstName === `` &&
                        filterInputs.lastName === `` &&
                        filterInputs.username === `` &&
                        filterInputs.unit === null &&
                        filterInputs.role === null
                      }
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        style={{ marginRight: 5 }}
                      />
                      ตกลง
                    </Button>
                  </div>
                </FilterContent>
              </Popover>
              <OparatorFlex>
                <div className="ft">
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={e => {
                      setFilterOpenAnchorEl(e.currentTarget)
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ marginRight: 5 }}
                    />
                    ค้นหา
                  </Button>
                  <Collapse
                    in={confirmedFilterInputs.rank !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ยศ: ${confirmedFilterInputs.rank}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`rank`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.firstName !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ชื่อ: ${confirmedFilterInputs.firstName}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`firstName`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.lastName !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`สกุล: ${confirmedFilterInputs.lastName}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`lastName`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.username !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ชื่อผู้ใช้งาน: ${confirmedFilterInputs.username}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`username`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.unit !== null}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`สังกัด: ${renderDivision(
                        confirmedFilterInputs.unit
                      )}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`unit`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.role !== null}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ระดับผู้ใช้งาน: ${
                        confirmedFilterInputs.role !== null
                          ? renderUserRole(confirmedFilterInputs.role.name)
                          : ``
                      }`}
                      color="primary"
                      onDelete={() => removeOneFilter(`role`)}
                    />
                  </Collapse>
                </div>
                <div className="lt">
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
                </div>
              </OparatorFlex>
            </>
          )}
          {usersData.length > 0 && (
            <>
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
                        <TableCell align="left">
                          <Link
                            onClick={() => {
                              setCurrentRow(row)
                              setUserDetailOpen(true)
                            }}
                          >
                            {row.username}
                          </Link>
                        </TableCell>
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
                          <Chip
                            label={
                              row.role !== null
                                ? renderUserRole(row.role.name)
                                : `-`
                            }
                            color={
                              roleLevel(row.role) >= 2 ? `primary` : `default`
                            }
                          />
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
                          {row.status !== null && renderStatus(row.status)}
                        </TableCell>
                        <TableCell align="right">
                          {row.status !== null && (
                            <>
                              <p style={{ margin: `0 0 0.25rem` }}>
                                {renderTableDate(row.status.createdAt, `date`)}
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
                  `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
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
                    setUserDetailOpen(true)
                  }}
                  disableRipple
                >
                  <FontAwesomeIcon icon={faSearch} style={{ marginRight: 5 }} />
                  ดูข้อมูลผู้ใช้งาน
                </MenuItem>
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

              <UserInfoDialog
                open={userDetailOpen}
                callback={() => {
                  setUserDetailOpen(false)
                  setCurrentRow(null)
                }}
                userId={currentRow !== null ? currentRow._id : ``}
              />
            </>
          )}
          {isError.status && (
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
