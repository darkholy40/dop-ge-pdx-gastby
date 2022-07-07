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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  // faCheckCircle,
  faEllipsisH,
  faPencilAlt,
  faSignOutAlt,
  faChevronLeft,
  faSearch,
} from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import { Link } from "../../components/styles"
import PersonInfoDialog from "../../components/people/person-info-dialog"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import renderDivision from "../../functions/render-division"
import roleLevel from "../../functions/role-level"

const PeopleListPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { searchPersonFilter } = useSelector(
    ({ peopleReducer }) => peopleReducer
  )
  const dispatch = useDispatch()
  const [peopleData, setPeopleData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState(null)
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: searchPersonFilter.currentPage,
    rowsPerPage: 10,
  })
  const [personDetailOpen, setPersonDetailOpen] = useState(false)

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "people->list",
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
    let role = ``
    let returnData = []

    if (
      searchPersonFilter.personName !== `` ||
      searchPersonFilter.personSurname !== `` ||
      searchPersonFilter.personId !== `` ||
      searchPersonFilter.personSid !== `` ||
      searchPersonFilter.personType !== ``
    ) {
      filter = `${
        searchPersonFilter.personName !== ``
          ? `Name_contains: "${searchPersonFilter.personName}"`
          : ``
      }
      ${
        searchPersonFilter.personSurname !== ``
          ? `Surname_contains: "${searchPersonFilter.personSurname}"`
          : ``
      }
      ${
        searchPersonFilter.personId !== ``
          ? `ID_Card: "${searchPersonFilter.personId}"`
          : ``
      }
      ${
        searchPersonFilter.personSid !== ``
          ? `SID_Card: "${searchPersonFilter.personSid}"`
          : ``
      }${
        searchPersonFilter.personType !== ``
          ? `type: "${searchPersonFilter.personType}"`
          : ``
      }`
    }

    if (roleLevel(userInfo.role) <= 1) {
      role = `
        division: "${userInfo.division._id}"
      `
    } else {
      role =
        searchPersonFilter.unit !== null
          ? `division: "${searchPersonFilter.unit._id}"`
          : ``
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    const whereCondition = `{
      ${role}
      number_contains: "${searchPersonFilter.posNumber}"
      ${
        filter !== ``
          ? `person: {
        ${filter}
      }`
          : `person_null: false`
      }
    }`

    try {
      const total = await client(token).query({
        query: gql`
          query PositionsCount {
            positionsConnection(where: ${whereCondition}) {
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
            query Positions {
              positions(where: ${whereCondition}, limit: ${
            tableOption.rowsPerPage
          }, start: ${parseInt(tableOption.rowsPerPage * tableOption.page)}) {
                _id
                position_type {
                  type
                  name
                }
                number
                division {
                  _id
                  division1
                  division2
                  division3
                }
                person {
                  _id
                  Prename
                  Name
                  Surname
                  ID_Card
                  SID_Card
                  type
                  staff_created
                  staff_updated
                  createdAt
                  updatedAt
                }
              }
            }
          `,
        })

        let lap = 0
        for (let thisPosition of res.data.positions) {
          returnData = [
            ...returnData,
            {
              orderNumber:
                lap + 1 + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: thisPosition.person._id,
              Prename: thisPosition.person.Prename,
              Name: thisPosition.person.Name,
              Surname: thisPosition.person.Surname,
              ID_Card: thisPosition.person.ID_Card,
              SID_Card: thisPosition.person.SID_Card,
              type: thisPosition.person.type,
              staff_created: thisPosition.person.staff_created,
              staff_updated: thisPosition.person.staff_updated,
              createdAt: thisPosition.person.createdAt,
              updatedAt: thisPosition.person.updatedAt,
              position: {
                _id: thisPosition._id,
                posName: thisPosition.position_type.name,
                posType: thisPosition.position_type.type,
                posNumber: thisPosition.number,
              },
              division: thisPosition.division,
            },
          ]

          lap++
        }

        if (returnData.length > 0) {
          setPeopleData(returnData)
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
    searchPersonFilter,
    dispatch,
    tableOption.page,
    tableOption.rowsPerPage,
  ])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
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
          <Seo title="ค้นหากำลังพล" />
          <Breadcrumbs
            previous={[
              {
                name:
                  roleLevel(userInfo.role) <= 1
                    ? `ประวัติกำลังพล (${renderDivision(userInfo.division)})`
                    : `ประวัติกำลังพล`,
                link: `/people/`,
              },
            ]}
            current="ค้นหากำลังพล"
          />

          {!isError.status ? (
            peopleData.length > 0 && (
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
                        type: `SET_SEARCH_PERSON_FILTER`,
                        searchPersonFilter: {
                          ...searchPersonFilter,
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
                          ชื่อ สกุล
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          เลขที่ตำแหน่ง
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          กลุ่มงาน
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ตำแหน่งในสายงาน
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ประเภท
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          สังกัด
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
                      {peopleData.map((row, rowIndex) => (
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
                            <Link
                              onClick={() => {
                                setCurrentRow(row)
                                setPersonDetailOpen(true)
                              }}
                            >
                              {`${row.Prename} ${row.Name} ${row.Surname}`}
                            </Link>
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.position.posNumber}
                          </TableCell>
                          <TableCell align="left">
                            {row.position.posType}
                          </TableCell>
                          <TableCell align="left">
                            {row.position.posName}
                          </TableCell>
                          <TableCell align="left">{row.type}</TableCell>
                          <TableCell align="left">
                            {renderDivision(row.division)}
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
                      type: `SET_SEARCH_PERSON_FILTER`,
                      searchPersonFilter: {
                        ...searchPersonFilter,
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
                      setPersonDetailOpen(true)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ marginRight: 5 }}
                    />
                    ดูประวัติกำลังพล
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)
                      navigate(`/people/edit/?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      style={{ marginRight: 5 }}
                    />
                    แก้ไขประวัติกำลังพล
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)
                      navigate(`/people/resignation/?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      style={{ marginRight: 5 }}
                    />
                    จำหน่ายสูญเสีย
                  </MenuItem>
                </Menu>

                <PersonInfoDialog
                  open={personDetailOpen}
                  callback={() => {
                    setPersonDetailOpen(false)
                    setCurrentRow(null)
                  }}
                  personId={currentRow !== null ? currentRow._id : ``}
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
                    onClick={() => navigate(`/people/`)}
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      style={{ marginRight: 5 }}
                    />
                    <span>กลับไปหน้าประวัติกำลังพล</span>
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

export default PeopleListPage
