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
  TextField,
  Collapse,
  Chip,
  Divider,
  Popover,
} from "@mui/material"
import { grey } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faEllipsisV,
  faRedo,
  faEllipsisH,
  faPencilAlt,
  faSearch,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import { Link, FilterContent, OparatorFlex } from "../../components/styles"
import DecorationsDialog from "../../components/databases/decorations-dialog"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import roleLevel from "../../functions/role-level"
import renderTableDate from "../../functions/render-table-date"

const Decorations = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const dispatch = useDispatch()
  const [data, setData] = useState([])
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
  const [formDialog, setFormDialog] = useState({
    open: false,
    type: `add`,
    dataId: ``,
  })
  const [filterOpenAnchorEl, setFilterOpenAnchorEl] = useState(null)
  const [filterInputs, setFilterInputs] = useState({
    short_name: ``,
    full_name: ``,
    eng_name: ``,
  })
  const [confirmedFilterInputs, setConfirmedFilterInputs] = useState({
    short_name: ``,
    full_name: ``,
    eng_name: ``,
  })
  const [firstStrike, setFirstStrike] = useState(false)

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "databases->decorations",
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

  const getDataFromDB = useCallback(async () => {
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

    if (confirmedFilterInputs.full_name !== ``) {
      filters += `
        full_name_contains: "${confirmedFilterInputs.full_name}"
      `
    }

    if (confirmedFilterInputs.short_name !== ``) {
      filters += `
        short_name_contains: "${confirmedFilterInputs.short_name}"
      `
    }

    if (confirmedFilterInputs.eng_name !== ``) {
      filters += `
        eng_name_contains: "${confirmedFilterInputs.eng_name}"
      `
    }

    try {
      const total = await client(token).query({
        query: gql`
          query DecorationsCount {
            decorationsConnection${
              filters !== `` ? `(where: {${filters}})` : ``
            } {
              aggregate {
                count
              }
            }
          }
        `,
      })

      setTableOption(prev => ({
        ...prev,
        totalRows: total.data.decorationsConnection.aggregate.count,
      }))

      if (total.data.decorationsConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Decorations {
              decorations(
                ${filters !== `` ? `where: {${filters}},` : ``}
                start: ${parseInt(tableOption.rowsPerPage * tableOption.page)},
                limit: ${tableOption.rowsPerPage},
              ) {
                _id
                short_name
                full_name
                eng_name
                createdAt
                updatedAt
              }
            }
          `,
        })

        let count = 0
        for (let row of res.data.decorations) {
          count++
          returnData = [
            ...returnData,
            {
              orderNumber:
                count + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: row._id,
              short_name: row.short_name,
              full_name: row.full_name,
              eng_name: row.eng_name,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          ]
        }

        setData(returnData)
        setFirstStrike(true)
      } else {
        setData([])
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
      short_name: filterInputs.short_name,
      full_name: filterInputs.full_name,
      eng_name: filterInputs.eng_name,
    })
    setConfirmedFilterInputs({
      short_name: filterInputs.short_name,
      full_name: filterInputs.full_name,
      eng_name: filterInputs.eng_name,
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
      [key]: ``,
    }))
    setConfirmedFilterInputs(prev => ({
      ...prev,
      [key]: ``,
    }))
  }

  const removeFilters = () => {
    setTableOption(prev => ({
      ...prev,
      page: 0,
      rowsPerPage: 10,
    }))
    setFilterOpenAnchorEl(null)
    setFilterInputs({
      short_name: ``,
      full_name: ``,
      eng_name: ``,
    })
    setConfirmedFilterInputs({
      short_name: ``,
      full_name: ``,
      eng_name: ``,
    })
  }

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `databases`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (token !== ``) {
      getDataFromDB()
    }
  }, [getDataFromDB, token])

  useEffect(() => {
    if (filterOpenAnchorEl !== null) {
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
          <Seo title="เครื่องราชอิสริยาภรณ์" />
          <Breadcrumbs
            previous={[
              {
                name: `การจัดการฐานข้อมูล`,
                link: `/databases/`,
              },
            ]}
            current="เครื่องราชอิสริยาภรณ์"
          />

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
                      label="ชื่อวุฒิการศึกษา"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.full_name}
                    />
                    <TextField
                      label="ชื่อย่อ"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          short_name: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.short_name}
                    />
                    <TextField
                      label="ชื่อภาษาอังกฤษ"
                      size="small"
                      variant="outlined"
                      onChange={e => {
                        setFilterInputs(prev => ({
                          ...prev,
                          eng_name: e.target.value,
                        }))
                      }}
                      onKeyDown={e => {
                        if (e.key === `Escape`) {
                          setFilterOpenAnchorEl(null)
                        }
                      }}
                      value={filterInputs.eng_name}
                    />
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
                        confirmedFilterInputs.full_name === `` &&
                        confirmedFilterInputs.short_name === `` &&
                        confirmedFilterInputs.eng_name === ``
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
                        filterInputs.full_name === `` &&
                        filterInputs.short_name === `` &&
                        filterInputs.eng_name === ``
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
                    in={confirmedFilterInputs.full_name !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ชื่อวุฒิการศึกษา: ${confirmedFilterInputs.full_name}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`full_name`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.short_name !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ชื่อย่อ: ${confirmedFilterInputs.short_name}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`short_name`)}
                    />
                  </Collapse>
                  <Collapse
                    in={confirmedFilterInputs.eng_name !== ``}
                    orientation="horizontal"
                  >
                    <Chip
                      label={`ชื่อภาษาอังกฤษ: ${confirmedFilterInputs.eng_name}`}
                      color="primary"
                      onDelete={() => removeOneFilter(`eng_name`)}
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
                      setFormDialog(prev => ({
                        ...prev,
                        open: true,
                        type: `add`,
                      }))
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      style={{ marginRight: 5 }}
                    />
                    เพิ่มข้อมูล
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
          {data.length > 0 && (
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
                        ชื่อเครื่องราชอิสริยาภรณ์
                      </TableCell>
                      <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                        ชื่อย่อ
                      </TableCell>
                      <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                        ชื่อภาษาอังกฤษ
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: primaryColor[200] }}
                        align="right"
                      >
                        วันที่สร้าง
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: primaryColor[200] }}
                        align="right"
                      >
                        วันที่อัปเดต
                      </TableCell>
                      <TableCell
                        sx={{ backgroundColor: primaryColor[200] }}
                      ></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, rowIndex) => (
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
                              setFormDialog(prev => ({
                                ...prev,
                                open: true,
                                type: `edit`,
                                dataId: row._id,
                              }))
                            }}
                          >
                            {row.full_name}
                          </Link>
                        </TableCell>
                        <TableCell align="left">
                          {row.short_name ? (
                            <Link
                              onClick={() => {
                                setFormDialog(prev => ({
                                  ...prev,
                                  open: true,
                                  type: `edit`,
                                  dataId: row._id,
                                }))
                              }}
                            >
                              {row.short_name}
                            </Link>
                          ) : (
                            `-`
                          )}
                        </TableCell>
                        <TableCell align="left">
                          {row.eng_name ? (
                            <Link
                              onClick={() => {
                                setFormDialog(prev => ({
                                  ...prev,
                                  open: true,
                                  type: `edit`,
                                  dataId: row._id,
                                }))
                              }}
                            >
                              {row.eng_name}
                            </Link>
                          ) : (
                            `-`
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <p style={{ margin: `0 0 0.25rem` }}>
                            {renderTableDate(row.createdAt, `date`)}
                          </p>
                          <p style={{ margin: 0 }}>
                            {renderTableDate(row.createdAt, `full-time`)}
                          </p>
                        </TableCell>
                        <TableCell align="right">
                          <p style={{ margin: `0 0 0.25rem` }}>
                            {renderTableDate(row.updatedAt, `date`)}
                          </p>
                          <p style={{ margin: 0 }}>
                            {renderTableDate(row.updatedAt, `full-time`)}
                          </p>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={event => {
                              setOptionAnchorEl(event.currentTarget)
                              setFormDialog(prev => ({
                                ...prev,
                                dataId: row._id,
                              }))
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
                    getDataFromDB()
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
                    setFormDialog(prev => ({
                      ...prev,
                      open: true,
                      type: `edit`,
                    }))
                  }}
                  disableRipple
                >
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    style={{ marginRight: 5 }}
                  />
                  แก้ไขข้อมูล
                </MenuItem>
              </Menu>

              <DecorationsDialog
                open={formDialog.open}
                type={formDialog.type}
                dataId={formDialog.dataId}
                onCloseCallback={() => {
                  setFormDialog(prev => ({
                    ...prev,
                    open: false,
                    dataId: ``,
                  }))
                }}
                onFinishCallback={() => getDataFromDB()}
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
                    onClick={() => getDataFromDB()}
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

export default Decorations
