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
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../components/apollo-client"

import Layout from "../../components/layout"
import Seo from "../../components/seo"
import Breadcrumbs from "../../components/breadcrumbs"
import PageNotFound from "../../components/page-not-found"
import Warning from "../../components/warning"
import renderDivision from "../../functions/renderDivision"

const ResignedPeopleListPage = () => {
  const { token, userInfo, primaryColor, searchPersonFilter } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [peopleData, setPeopleData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: searchPersonFilter.currentPage,
    rowsPerPage: 10,
  })

  const getPosition = useCallback(async () => {
    let filter = ``
    let role = ``
    let returnData = []

    if (
      searchPersonFilter.personName !== `` ||
      searchPersonFilter.personSurname !== `` ||
      searchPersonFilter.personId !== `` ||
      searchPersonFilter.personSid !== ``
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
      }`
    }

    if (userInfo.role.name !== `Administrator`) {
      role = `
        division: "${userInfo.division._id}"
      `
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
            ? `
          number_contains: "${searchPersonFilter.posNumber}"
      `
            : ``
        }
      }
    }`

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
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

      if (total.data.peopleConnection.aggregate.totalCount > 0) {
        const res = await client(token).query({
          query: gql`
            query Person {
              people(where: ${whereCondition}, start: ${parseInt(
            tableOption.rowsPerPage * tableOption.page
          )}) {
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

        for (let thisPerson of res.data.people) {
          const resUser = await client(token).query({
            query: gql`
              query User {
                user(id: "${thisPerson.staff_updated}") {
                  _id
                  name
                  surname
                }
              }
            `,
          })

          returnData = [
            ...returnData,
            {
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
              staff_updated_fullname: `${resUser.data.user.name} ${
                resUser.data.user.surname || ``
              }`,
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
      backdropOpen: false,
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

    dispatch({
      type: `SET_REDIRECT_PAGE`,
      redirectPage: `/people/list/`,
    })
  }, [dispatch])

  useEffect(() => {
    if (token !== ``) {
      getPosition()
    }
  }, [getPosition, token])

  return (
    <Layout>
      {token !== `` ? (
        <>
          <Seo title="ค้นหากำลังพลที่ลาออกแล้ว" />
          <Breadcrumbs
            previous={[
              {
                name:
                  userInfo.role.name !== `Administrator`
                    ? `จัดการประวัติกำลังพล (${
                        userInfo.division !== null
                          ? renderDivision(userInfo.division)
                          : `-`
                      })`
                    : `จัดการประวัติกำลังพล`,
                link: `/people/`,
              },
            ]}
            current="ค้นหากำลังพลที่ลาออกแล้ว"
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
                  }}
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
                          เลขที่ตำแหน่ง
                        </TableCell>
                        <TableCell sx={{ backgroundColor: primaryColor[200] }}>
                          ชื่อ สกุล
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
                            {rowIndex + 1}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.position.posNumber}
                          </TableCell>
                          <TableCell align="left">
                            {`${row.Prename} ${row.Name} ${row.Surname}`}
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
                            {row.staff_updated_fullname}
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
