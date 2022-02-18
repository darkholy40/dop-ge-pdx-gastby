import React, { useEffect, useCallback, useState } from "react"
import { navigate, Link } from "gatsby"
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
} from "@mui/material"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheckCircle,
  faEllipsisH,
  faPen,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons"

import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import PageNotFound from "../../components/PageNotFound"
import Warning from "../../components/Warning"
import renderDivision from "../../functions/renderDivision"

const PositionsPage = () => {
  const { token, userInfo, url, primaryColor, searchPositionFilter } =
    useSelector(state => state)
  const dispatch = useDispatch()
  const [posData, setPosData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState({})
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: 0,
    rowsPerPage: 10,
  })

  const getPosition = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let filter = ``
    let whereCondition = ``
    let returnData = []

    filter = `
      position_type: {
        type_contains: "${searchPositionFilter.posType}"
        name_contains: "${searchPositionFilter.posName}"
      }
    `

    if (userInfo.role.name === `Administrator`) {
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
      backdropOpen: true,
    })

    try {
      const res = await client.query({
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

      console.log(res)

      if (res.data.positions.length > 0) {
        let lap = 0
        for (let thisPos of res.data.positions) {
          let person = {
            _id: ``,
            prename: ``,
            name: ``,
            surname: ``,
          }
          if (thisPos.person !== null) {
            const resPerson = await client.query({
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
        setPosData(returnData)

        const total = await client.query({
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
    url,
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

    dispatch({
      type: `SET_REDIRECT_PAGE`,
      redirectPage: `/positions/list`,
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
          <Seo title="ค้นหาคลังตำแหน่ง" />
          <Breadcrumbs
            previous={[
              {
                name: `จัดการคลังตำแหน่ง`,
                link: `/positions`,
              },
            ]}
            current="ค้นหาคลังตำแหน่ง"
          />

          {!isError.status ? (
            posData.length > 0 && (
              <>
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
                          อัตรากำลังจังหวัดชายแดนภาคใต้
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
                              <Link
                                to={`/people/edit?id=${row.person._id}`}
                              >{`${row.person.prename} ${row.person.name} ${row.person.surname}`}</Link>
                            ) : (
                              <span>-</span>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.isSouth && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{
                                  fontSize: 20,
                                  color: primaryColor[500],
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.isOpen && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{
                                  fontSize: 20,
                                  color: primaryColor[500],
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

                      navigate(`/positions/edit?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon icon={faPen} style={{ marginRight: 5 }} />
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
                    onClick={() => navigate(`/positions`)}
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

export default PositionsPage
