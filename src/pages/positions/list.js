import React, { useEffect, useCallback, useState } from "react"
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
  IconButton,
  Menu,
  MenuItem,
  Button,
  TablePagination,
  Pagination,
} from "@mui/material"
import { green } from "@mui/material/colors"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheckCircle,
  faEllipsisH,
  faPencilAlt,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const PositionsListPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { searchPositionFilter } = useSelector(
    ({ positionsReducer }) => positionsReducer
  )
  const dispatch = useDispatch()
  const [posData, setPosData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState(null)
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: searchPositionFilter.currentPage,
    rowsPerPage: 10,
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
                description: "positions -> list",
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

  const getPosition = useCallback(async () => {
    let filter = ``
    let whereCondition = ``
    let returnData = []

    filter = `
      position_type: {
        type_contains: "${searchPositionFilter.posType}"
        name_contains: "${searchPositionFilter.posName}"
      }
    `

    if (roleLevel(userInfo.role) > 1) {
      whereCondition = `where: {
        ${filter}
        ${
          searchPositionFilter.unit !== null
            ? `division: "${searchPositionFilter.unit._id}"`
            : ``
        }
      }`
    } else {
      whereCondition = `where: {
        division: "${userInfo.division._id}"
        ${filter}
      }`
    }

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
          query PositionsCount {
            positionsConnection(${whereCondition}) {
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
        totalRows: total.data.positionsConnection.aggregate.count,
      }))

      if (total.data.positionsConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Position {
              positions(${whereCondition}, limit: ${
            tableOption.rowsPerPage
          }, start: ${parseInt(tableOption.rowsPerPage * tableOption.page)}) {
                _id
                number
                position_type {
                  type
                  name
                  order
                }
                isOpen
                isSouth
                staff_created
                staff_updated
                published_at
                createdAt
                updatedAt
                division {
                  id
                  division1
                  division2
                  division3
                }
                person {
                  _id
                }
              }
            }
          `,
        })

        // console.log(res)

        let lap = 0
        for (let thisPos of res.data.positions) {
          let person = {
            _id: ``,
            prename: ``,
            name: ``,
            surname: ``,
          }
          if (thisPos.person !== null) {
            const resPerson = await client(token).query({
              query: gql`
                query Person {
                  person(id: "${thisPos.person._id}") {
                    _id
                    Prename
                    Name
                    Surname
                  }
                }
              `,
            })

            person = {
              _id: resPerson.data.person._id,
              prename: resPerson.data.person.Prename,
              name: resPerson.data.person.Name,
              surname: resPerson.data.person.Surname,
            }
          }

          returnData = [
            ...returnData,
            {
              _id: thisPos._id,
              orderNumber:
                lap + 1 + parseInt(tableOption.rowsPerPage * tableOption.page),
              position: {
                type: thisPos.position_type.type,
                name: thisPos.position_type.name,
                number: thisPos.number,
              },
              isOpen: thisPos.isOpen,
              isSouth: thisPos.isSouth,
              staff_created: thisPos.staff_created,
              staff_updated: thisPos.staff_updated,
              published_at: thisPos.published_at,
              createdAt: thisPos.createdAt,
              updatedAt: thisPos.updatedAt,
              division: thisPos.division,
              person: person,
            },
          ]

          lap++
        }

        // console.log(returnData)
        if (returnData.length > 0) {
          setPosData(returnData)
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

    // setTimeout(() => {
    //   window.scrollTo({
    //     top: 0,
    //     left: 0,
    //     behavior: "smooth",
    //   })
    // }, 200)
  }, [
    token,
    userInfo,
    searchPositionFilter,
    dispatch,
    tableOption.page,
    tableOption.rowsPerPage,
  ])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (token !== ``) {
      getPosition()
    }
  }, [getPosition, token])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 1 ? (
        <>
          <Seo title="ค้นหาคลังตำแหน่ง" />
          <Breadcrumbs
            previous={[
              {
                name:
                  roleLevel(userInfo.role) <= 1
                    ? `คลังตำแหน่ง (${renderDivision(userInfo.division)})`
                    : `คลังตำแหน่ง`,
                link: `/positions/`,
              },
            ]}
            current="ค้นหาคลังตำแหน่ง"
          />

          {!isError.status ? (
            posData.length > 0 && (
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

                      dispatch({
                        type: `SET_SEARCH_POSITION_FILTER`,
                        searchPositionFilter: {
                          ...searchPositionFilter,
                          currentPage: newPage - 1,
                        },
                      })
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
                          ตำแหน่ง
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          กลุ่มงาน
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          เลขที่ตำแหน่ง
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          สังกัด
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ชื่อ สกุล (ผู้ครองตำแหน่ง)
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: primaryColor[200] }}
                        >
                          เปิดอัตรา
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: primaryColor[200] }}
                        >
                          อัตรากำลังจังหวัดชายแดนภาคใต้
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: primaryColor[200] }}
                        >
                          ตัวเลือก
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {posData.map((row, rowIndex) => (
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
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.position.name}
                          </TableCell>
                          <TableCell align="left">
                            {row.position.type}
                          </TableCell>
                          <TableCell align="left">
                            {row.position.number}
                          </TableCell>
                          <TableCell align="left">
                            {renderDivision(row.division)}
                          </TableCell>
                          <TableCell align="left">
                            {row.person._id !== `` ? (
                              <span>{`${row.person.prename} ${row.person.name} ${row.person.surname}`}</span>
                            ) : (
                              <span>-</span>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.isOpen && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{
                                  fontSize: 20,
                                  color: green[500],
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.isSouth && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{
                                  fontSize: 20,
                                  color: green[500],
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={event => {
                                setAnchorEl(event.currentTarget)
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

                    dispatch({
                      type: `SET_SEARCH_POSITION_FILTER`,
                      searchPositionFilter: {
                        ...searchPositionFilter,
                        currentPage: newPage,
                      },
                    })
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
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => {
                    setAnchorEl(null)
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
                      setAnchorEl(null)

                      navigate(`/positions/edit/?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      style={{ marginRight: 5 }}
                    />
                    แก้ไขคลังตำแหน่ง
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
                    onClick={() => navigate(`/positions/`)}
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      style={{ marginRight: 5 }}
                    />
                    <span>กลับไปหน้าคลังตำแหน่ง</span>
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

export default PositionsListPage
