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
  Button,
  TablePagination,
  Pagination,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronLeft,
  faEllipsisH,
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
import renderFullname from "../../functions/render-fullname"
import roleLevel from "../../functions/role-level"

const ResignedPeopleListPage = () => {
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
                description: "people->resigned-list",
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
      role = `division: "${userInfo.division._id}"`
    } else {
      role =
        searchPersonFilter.unit !== null
          ? `division: "${searchPersonFilter.unit._id}"`
          : ``
    }

    const whereCondition = `{
      isResigned: true
      ${filter !== `` ? `${filter}` : ``}
      position: {
        ${role}
        ${
          searchPersonFilter.posNumber !== ``
            ? `number_contains: "${searchPersonFilter.posNumber}"`
            : ``
        }
      }
    }`

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
          query PersonCount {
            peopleConnection(where: ${whereCondition}) {
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
        totalRows: total.data.peopleConnection.aggregate.count,
      }))

      if (total.data.peopleConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Person {
              people(where: ${whereCondition}, limit: ${
            tableOption.rowsPerPage
          }, start: ${parseInt(tableOption.rowsPerPage * tableOption.page)}) {
                _id
                Prename
                Name
                Surname
                ID_Card
                SID_Card
                isResigned
                resignationNote
                staff_created
                staff_updated
                createdAt
                updatedAt
                position {
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
                }
              }
            }
          `,
        })

        let lap = 0
        for (let thisPerson of res.data.people) {
          const resUser = await client(token).query({
            query: gql`
              query User {
                user(id: "${thisPerson.staff_updated}") {
                  _id
                  rank
                  name
                  surname
                }
              }
            `,
          })

          returnData = [
            ...returnData,
            {
              orderNumber:
                lap + 1 + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: thisPerson._id,
              Prename: thisPerson.Prename,
              Name: thisPerson.Name,
              Surname: thisPerson.Surname,
              ID_Card: thisPerson.ID_Card,
              SID_Card: thisPerson.SID_Card,
              isResigned: thisPerson.isResigned,
              resignationNote: thisPerson.resignationNote,
              staff_created: thisPerson.staff_created,
              staff_updated: thisPerson.staff_updated,
              staff_updated_userinfo: resUser.data.user,
              createdAt: thisPerson.createdAt,
              updatedAt: thisPerson.updatedAt,
              position: {
                _id:
                  thisPerson.position !== null ? thisPerson.position._id : ``,
                posName:
                  thisPerson.position !== null
                    ? thisPerson.position.position_type.name
                    : ``,
                posType:
                  thisPerson.position !== null
                    ? thisPerson.position.position_type.type
                    : ``,
                posNumber:
                  thisPerson.position !== null
                    ? thisPerson.position.number
                    : ``,
              },
              division:
                thisPerson.position !== null
                  ? thisPerson.position.division
                  : null,
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
          <Seo title="ค้นหากำลังพลที่จำหน่ายสูญเสีย" />
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
            current="ค้นหากำลังพลที่จำหน่ายสูญเสีย"
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
                          สังกัด
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          สาเหตุการออก
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          เจ้าหน้าที่บันทึกข้อมูล
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
                              {renderFullname({
                                rank: row.Prename,
                                name: row.Name,
                                surname: row.Surname,
                              })}
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
                          <TableCell align="left">
                            {renderDivision(row.division)}
                          </TableCell>
                          <TableCell align="left">
                            {row.resignationNote}
                          </TableCell>
                          <TableCell align="left">
                            {renderFullname(row.staff_updated_userinfo)}
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
                </Menu>

                <PersonInfoDialog
                  open={personDetailOpen}
                  callback={() => {
                    setPersonDetailOpen(false)
                    setCurrentRow(null)
                  }}
                  personId={currentRow !== null ? currentRow._id : ``}
                  viewOnly
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

export default ResignedPeopleListPage
