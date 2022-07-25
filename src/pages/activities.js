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
} from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircle,
  faStopwatch,
  faEye,
  faSave,
  faFileExcel,
  faRedo,
  faChevronRight,
  faSync,
  faKey,
} from "@fortawesome/free-solid-svg-icons"
import { green, grey, blue, red } from "@mui/material/colors"

import { client, gql } from "../functions/apollo-client"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import { Link } from "../components/styles"
import PersonInfoDialog from "../components/people/person-info-dialog"
import PositionInfoDialog from "../components/positions/position-info-dialog"
import UserInfoDialog from "../components/users/user-info-dialog"
import PageNotFound from "../components/page-not-found"
import Warning from "../components/warning"
import renderTableDate from "../functions/render-table-date"
import renderFullname from "../functions/render-fullname"
import roleLevel from "../functions/role-level"

const Oparator = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const ActivitiesPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const dispatch = useDispatch()
  const [logsData, setLogsData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [tableOption, setTableOption] = useState({
    totalRows: 0,
    page: 0,
    rowsPerPage: 10,
  })
  const [detialModal, setDetialModal] = useState({
    open: false,
    type: ``,
    id: ``,
  })

  const savePageView = useCallback(() => {
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "activities",
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

  const getLogs = useCallback(async () => {
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
          query LogsCount {
            logsConnection {
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
        totalRows: total.data.logsConnection.aggregate.count,
      }))

      if (total.data.logsConnection.aggregate.count > 0) {
        const res = await client(token).query({
          query: gql`
            query Logs {
              logs(start: ${parseInt(
                tableOption.rowsPerPage * tableOption.page
              )}, limit: ${tableOption.rowsPerPage}, sort: "_id:desc") {
                _id
                action
                description
                users_permissions_user {
                  _id
                  username
                  rank
                  name
                  surname
                  role {
                    name
                  }
                }
                createdAt
              }
            }
          `,
        })

        let count = 0
        for (let thisLog of res.data.logs) {
          count++
          returnData = [
            ...returnData,
            {
              orderNumber:
                count + parseInt(tableOption.rowsPerPage * tableOption.page),
              _id: thisLog._id,
              action: thisLog.action,
              description: thisLog.description,
              users_permissions_user: thisLog.users_permissions_user,
              created_at: thisLog.createdAt,
            },
          ]
        }

        if (returnData.length > 0) {
          setLogsData(returnData)
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

  const renderAction = (action, description) => {
    let option = {
      description: description,
      link: false,
      type: ``,
      icon: faCircle,
      color: grey[900],
    }
    const title = description.split(` => `)[0]
    const id = description.split(` => `)[1]

    switch (action) {
      case `auth`:
        switch (description) {
          case `login`:
            return (
              <>
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: green[500], marginRight: 8 }}
                />
                <span>{`ลงชื่อเข้าใช้งาน`}</span>
              </>
            )

          case `logout`:
            return (
              <>
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: grey[500], marginRight: 8 }}
                />
                <span>{`ลงชื่อออก`}</span>
              </>
            )

          case `token expired`:
            return (
              <>
                <FontAwesomeIcon
                  icon={faStopwatch}
                  style={{
                    color: red[500],
                    marginRight: 8,
                    fontSize: `1.125rem`,
                  }}
                />
                <span>{`หมดเวลาในการเข้าใช้งาน`}</span>
              </>
            )

          default:
            return (
              <>
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: red[500], marginRight: 8 }}
                />
                <span>{description}</span>
              </>
            )
        }

      case `view`:
        switch (title) {
          case `users->add`:
            option = {
              ...option,
              description: `users/add`,
            }
            break

          case `users->view`:
            option = {
              ...option,
              description: `users/view`,
              link: true,
              type: `users`,
            }
            break

          case `users->edit`:
            option = {
              ...option,
              description: `users/add`,
              link: true,
              type: `users`,
            }
            break

          case `people->add`:
            option = {
              ...option,
              description: `people/add`,
            }
            break

          case `people->view`:
            option = {
              ...option,
              description: `people/view`,
              link: true,
              type: `people`,
            }
            break

          case `people->edit`:
            option = {
              ...option,
              description: `people/edit`,
              link: true,
              type: `people`,
            }
            break

          case `people->list`:
            option = {
              ...option,
              description: `people/list`,
            }
            break

          case `people->resigned-list`:
            option = {
              ...option,
              description: `people/resigned-list`,
            }
            break

          case `people->resignation`:
            option = {
              ...option,
              description: `people/resignation`,
              link: true,
              type: `people`,
            }
            break

          case `positions->add`:
            option = {
              ...option,
              description: `positions/add`,
            }
            break

          case `positions->view`:
            option = {
              ...option,
              description: `positions/view`,
              link: true,
              type: `positions`,
            }
            break

          case `positions->edit`:
            option = {
              ...option,
              description: `positions/edit`,
              link: true,
              type: `positions`,
            }
            break

          case `positions->list`:
            option = {
              ...option,
              description: `positions/list`,
            }
            break

          default:
            break
        }

        return (
          <>
            <FontAwesomeIcon
              icon={faEye}
              style={{ color: grey[900], marginRight: 8 }}
            />
            <span>{option.description}</span>

            {id !== undefined && (
              <>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={{ marginLeft: 8, marginRight: 8 }}
                />
                {option.link ? (
                  <Link
                    onClick={() => {
                      setDetialModal({
                        open: true,
                        type: option.type,
                        id: id,
                      })
                    }}
                  >
                    {id}
                  </Link>
                ) : (
                  <span>{id}</span>
                )}
              </>
            )}
          </>
        )

      case `action`:
        switch (title) {
          case `users->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลผู้ใช้งาน`,
              link: true,
              type: `users`,
              icon: faSave,
              color: green[700],
            }
            break

          case `users->save`:
            option = {
              ...option,
              description: `แก้ไขข้อมูลผู้ใช้งาน`,
              link: true,
              type: `users`,
              icon: faSave,
              color: green[700],
            }
            break

          case `people->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลกำลังพล`,
              link: true,
              type: `people`,
              icon: faSave,
              color: green[700],
            }
            break

          case `people->save`:
            option = {
              ...option,
              description: `แก้ไขข้อมูลกำลังพล`,
              link: true,
              type: `people`,
              icon: faSave,
              color: green[700],
            }
            break

          case `people->resignation->save`:
            option = {
              ...option,
              description: `จำหน่ายสูญเสียกำลังพล`,
              link: true,
              type: `people`,
              icon: faSave,
              color: green[700],
            }
            break

          case `positions->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลคลังตำแหน่ง`,
              link: true,
              type: `positions`,
              icon: faSave,
              color: green[700],
            }
            break

          case `positions->save`:
            option = {
              ...option,
              description: `แก้ไขข้อมูลคลังตำแหน่ง`,
              link: true,
              type: `positions`,
              icon: faSave,
              color: green[700],
            }
            break

          case `download->flowout`:
            option = {
              ...option,
              description: `ออกรายงานรายชื่อพนักงานราชการและตำแหน่งว่าง (Stock)`,
              icon: faFileExcel,
              color: green[800],
            }
            break

          case `download->stock`:
            option = {
              ...option,
              description: `ออกรายงานรายชื่อพนักงานราชการที่ออกในปีงบประมาณที่ผ่านมา (Flow-Out)`,
              icon: faFileExcel,
              color: green[800],
            }
            break

          case `download->static`:
            option = {
              ...option,
              description: `ดาวน์โหลดข้อมูลระบบ`,
              icon: faSync,
              color: blue[700],
            }
            break

          case `update->static`:
            option = {
              ...option,
              description: `อัปเดตข้อมูลระบบ`,
              icon: faSync,
              color: blue[700],
            }
            break

          case `education-levels->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลระดับการศึกษา`,
              icon: faSave,
              color: green[700],
            }
            break

          case `education-levels->update`:
            option = {
              ...option,
              description: `อัปเดตข้อมูลระดับการศึกษา`,
              icon: faSave,
              color: green[700],
            }
            break

          case `education-names->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลวุฒิการศึกษา`,
              icon: faSave,
              color: green[700],
            }
            break

          case `education-names->update`:
            option = {
              ...option,
              description: `อัปเดตข้อมูลวุฒิการศึกษา`,
              icon: faSave,
              color: green[700],
            }
            break

          case `educational-institutions->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลสถาบันการศึกษา`,
              icon: faSave,
              color: green[700],
            }
            break

          case `educational-institutions->update`:
            option = {
              ...option,
              description: `อัปเดตข้อมูลสถาบันการศึกษา`,
              icon: faSave,
              color: green[700],
            }
            break

          case `countries->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลรายชื่อประเทศ`,
              icon: faSave,
              color: green[700],
            }
            break

          case `countries->update`:
            option = {
              ...option,
              description: `อัปเดตข้อมูลรายชื่อประเทศ`,
              icon: faSave,
              color: green[700],
            }
            break

          case `decorations->create`:
            option = {
              ...option,
              description: `เพิ่มข้อมูลเครื่องราชอิสริยาภรณ์`,
              icon: faSave,
              color: green[700],
            }
            break

          case `decorations->update`:
            option = {
              ...option,
              description: `อัปเดตข้อมูลเครื่องราชอิสริยาภรณ์`,
              icon: faSave,
              color: green[700],
            }
            break

          case `change password`:
            option = {
              ...option,
              description: `เปลี่ยนรหัสผ่าน`,
              icon: faKey,
              color: blue[500],
            }
            break

          default:
            break
        }

        return (
          <>
            <FontAwesomeIcon
              icon={option.icon}
              style={{
                color: option.color,
                marginRight: 8,
                fontSize: `1.125rem`,
              }}
            />
            <span>{option.description}</span>

            {id !== undefined && (
              <>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={{ marginLeft: 8, marginRight: 8 }}
                />
                {option.link ? (
                  <Link
                    onClick={() => {
                      setDetialModal({
                        open: true,
                        type: option.type,
                        id: id,
                      })
                    }}
                  >
                    {id}
                  </Link>
                ) : (
                  <span>{id}</span>
                )}
              </>
            )}
          </>
        )

      default:
        return (
          <>
            {action}: {description}
          </>
        )
    }
  }

  useEffect(() => {
    if (token !== ``) {
      getLogs()
    }
  }, [getLogs, token])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `activities`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="ประวัติการใช้งานระบบ" />
          <Breadcrumbs current="ประวัติการใช้งานระบบ" />

          {!isError.status ? (
            logsData.length > 0 && (
              <>
                <Oparator>
                  <Button
                    style={{
                      borderRadius: `100px`,
                    }}
                    color="primary"
                    variant="outlined"
                    onClick={() => getLogs()}
                  >
                    <FontAwesomeIcon icon={faRedo} style={{ fontSize: 16 }} />
                  </Button>
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
                          การกระทำ
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: primaryColor[200] }}
                          align="right"
                        >
                          วันที่สร้าง
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logsData.map((row, rowIndex) => (
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
                            {row.users_permissions_user !== null
                              ? row.users_permissions_user.username
                              : `-`}
                          </TableCell>
                          <TableCell align="left">
                            {row.users_permissions_user !== null
                              ? renderFullname(row.users_permissions_user)
                              : `-`}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {renderAction(row.action, row.description)}
                          </TableCell>
                          <TableCell align="right">
                            <p style={{ margin: `0 0 0.25rem` }}>
                              {renderTableDate(row.created_at, `date`)}
                            </p>
                            <p style={{ margin: 0 }}>
                              {renderTableDate(row.created_at, `full-time`)}
                            </p>
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

                <PersonInfoDialog
                  open={detialModal.open && detialModal.type === `people`}
                  callback={() => {
                    setDetialModal(prev => ({
                      ...prev,
                      open: false,
                      id: ``,
                    }))
                  }}
                  personId={detialModal.id}
                  viewOnly
                />
                <PositionInfoDialog
                  open={detialModal.open && detialModal.type === `positions`}
                  callback={() => {
                    setDetialModal(prev => ({
                      ...prev,
                      open: false,
                      id: ``,
                    }))
                  }}
                  positionId={detialModal.id}
                  viewOnly
                />
                <UserInfoDialog
                  open={detialModal.open && detialModal.type === `users`}
                  callback={() => {
                    setDetialModal(prev => ({
                      ...prev,
                      open: false,
                      id: ``,
                    }))
                  }}
                  userId={detialModal.id}
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
                    onClick={() => window.location.reload()}
                  >
                    <FontAwesomeIcon icon={faRedo} style={{ marginRight: 5 }} />
                    <span>โหลดหน้านี้อีกครั้ง</span>
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

export default ActivitiesPage
