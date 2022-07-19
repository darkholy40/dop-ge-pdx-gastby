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
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faEllipsisV,
  faRedo,
  faEllipsisH,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import { Link } from "../../components/styles"
import EducationLevelsDialog from "../../components/databases/education-levels-dialog"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import roleLevel from "../../functions/role-level"
import renderTableDate from "../../functions/render-table-date"

const Oparator = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 1rem;
`

const EducationLevels = () => {
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

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "databases->education-levels",
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
          query EducationLevelsCount {
            educationLevelsConnection {
              aggregate {
                count
              }
            }
          }
        `,
      })

      setTableOption(prev => ({
        ...prev,
        totalRows: total.data.educationLevelsConnection.aggregate.count,
      }))

      if (total.data.educationLevelsConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query EducationLevels {
              educationLevels(
                start: ${parseInt(tableOption.rowsPerPage * tableOption.page)},
                limit: ${tableOption.rowsPerPage},
              ) {
                _id
                name
                createdAt
                updatedAt
              }
            }
          `,
        })

        let count = 0
        for (let row of res.data.educationLevels) {
          count++
          returnData = [
            ...returnData,
            {
              orderNumber:
                count + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: row._id,
              name: row.name,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          ]
        }

        if (returnData.length > 0) {
          setData(returnData)
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
  }, [token, dispatch, tableOption.page, tableOption.rowsPerPage])

  useEffect(() => {
    if (token !== ``) {
      getDataFromDB()
    }
  }, [getDataFromDB, token])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `databases`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="ระดับการศึกษา" />
          <Breadcrumbs
            previous={[
              {
                name: `การจัดการฐานข้อมูล`,
                link: `/databases/`,
              },
            ]}
            current="ระดับการศึกษา"
          />

          {!isError.status ? (
            data.length > 0 && (
              <>
                <Oparator>
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
                          ชื่อระดับการศึกษา
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
                              {row.name}
                            </Link>
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

                <EducationLevelsDialog
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

export default EducationLevels
