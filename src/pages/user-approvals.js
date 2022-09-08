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
  faEllipsisV,
  faRedo,
  faEllipsisH,
  faSearch,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { grey } from "@mui/material/colors"

import { client, gql } from "../functions/apollo-client"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import { Link, FilterContent, OparatorFlex, Flex } from "../components/styles"
import RegisteredUserInfoDialog from "../components/registrations/registered-user-info-dialog"
import PageNotFound from "../components/page-not-found"
import Warning from "../components/warning"
import renderTableDate from "../functions/render-table-date"
import renderFullname from "../functions/render-fullname"
import renderDivision from "../functions/render-division"
import roleLevel from "../functions/role-level"

const initialStates = {
  filterInputs: {
    rank: ``,
    firstName: ``,
    lastName: ``,
    unit: null,
  },
}

const UserApprovalsPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { units } = useSelector(({ staticReducer }) => staticReducer)
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
                description: "user-approvals",
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
    let filters = `is_approved: false`

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

    if (confirmedFilterInputs.unit !== null) {
      filters += `
        division: "${confirmedFilterInputs.unit._id}"
      `
    }

    try {
      const total = await client(token).query({
        query: gql`
          query RegistrationsCount {
            registrationsConnection(
              where: {
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
        totalRows: total.data.registrationsConnection.aggregate.count,
      }))

      if (total.data.registrationsConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Registrations {
              registrations(
                start: ${parseInt(tableOption.rowsPerPage * tableOption.page)},
                limit: ${tableOption.rowsPerPage},
                where: {
                  ${filters !== `` ? `${filters}` : ``} 
                }
              ) {
                _id
                username
                rank
                name
                surname
                email
                position
                is_approved
                is_completed
                createdAt
                division {
                  _id
                  division1
                  division2
                  division3
                }
              }
            }
          `,
        })

        let count = 0
        for (let thisUser of res.data.registrations) {
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
              email: thisUser.email,
              position: thisUser.position,
              division: thisUser.division,
              created_date: thisUser.createdAt,
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
      unit: filterInputs.unit,
    })
    setConfirmedFilterInputs({
      ...initialStates.filterInputs,
      rank: filterInputs.rank,
      firstName: filterInputs.firstName,
      lastName: filterInputs.lastName,
      unit: filterInputs.unit,
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
      currentPage: `user-approvals`,
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
          <Seo title="การอนุมัติผู้ใช้งาน" />
          <Breadcrumbs current="การอนุมัติผู้ใช้งาน" />

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
                        confirmedFilterInputs.unit === null
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
                        filterInputs.unit === null
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
                </div>
                <div className="lt">
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
                        อีเมล
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: primaryColor[200] }}
                        align="right"
                      >
                        วันที่ลงทะเบียน
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: primaryColor[200] }}
                        align="center"
                      >
                        การอนุมัติ
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
                          {row.position || `-`}
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          {row.email}
                        </TableCell>
                        <TableCell align="right">
                          {row.status !== null && (
                            <>
                              <p style={{ margin: `0 0 0.25rem` }}>
                                {renderTableDate(row.created_date, `date`)}
                              </p>
                              <p style={{ margin: 0 }}>
                                {renderTableDate(row.created_date, `full-time`)}
                              </p>
                            </>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <div
                            style={{
                              display: `flex`,
                              justifyContent: `center`,
                              alignItems: `center`,
                            }}
                          >
                            <Button
                              style={{
                                minWidth: 35,
                                width: 35,
                                height: 35,
                                borderRadius: `100%`,
                                marginRight: 5,
                              }}
                              color="success"
                              variant="contained"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                style={{ fontSize: 16 }}
                              />
                            </Button>
                            <Button
                              style={{
                                minWidth: 35,
                                width: 35,
                                height: 35,
                                borderRadius: `100%`,
                              }}
                              color="error"
                              variant="outlined"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                style={{ fontSize: 16 }}
                              />
                            </Button>
                          </div>
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
                  ดูข้อมูลผู้ลงทะเบียน
                </MenuItem>
              </Menu>

              <RegisteredUserInfoDialog
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

export default UserApprovalsPage
