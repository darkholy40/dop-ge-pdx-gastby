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
} from "@mui/material"
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  // faCheckCircle,
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
  const { token, userInfo, url, primaryColor, searchPersonFilter } =
    useSelector(state => state)
  const dispatch = useDispatch()
  const [peopleData, setPeopleData] = useState([])
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState({})

  const getPosition = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let filter = ``
    let whereCondition = ``
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
      whereCondition = `
        division: "${userInfo.division._id}"
      `
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await client.query({
        query: gql`
          query Positions {
            positions(where: {
              ${whereCondition}
              number_contains: "${searchPersonFilter.posNumber}"
              ${
                filter !== ``
                  ? `person: {
                ${filter}
              }`
                  : `person_null: false`
              }
              ${
                searchPersonFilter.unit !== null
                  ? `division: "${searchPersonFilter.unit._id}"`
                  : ``
              }
            }) {
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
                staff_created
                staff_updated
                createdAt
                updatedAt
              }
            }
          }
        `,
      })

      if (res.data.positions.length > 0) {
        for (let thisPosition of res.data.positions) {
          returnData = [
            ...returnData,
            {
              _id: thisPosition.person._id,
              Prename: thisPosition.person.Prename,
              Name: thisPosition.person.Name,
              Surname: thisPosition.person.Surname,
              ID_Card: thisPosition.person.ID_Card,
              SID_Card: thisPosition.person.SID_Card,
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

          // let position = {
          //   _id: ``,
          //   posName: ``,
          //   posType: ``,
          //   posNumber: ``,
          // }

          // if (thisPosition.person._id !== ``) {
          // const resPerson = await client.query({
          //   query: gql`
          //     query Positions {
          //       positions(where: {
          //         person._id: "${thisPosition._id}"
          //         number_contains: "${searchPersonFilter.posNumber}"
          //       }) {
          //         _id
          //         position_type {
          //           type
          //           name
          //         }
          //         number
          //         division {
          //           _id
          //           division1
          //           division2
          //           division3
          //         }
          //       }
          //     }
          //   `,
          // })

          // if (resPerson.data.positions.length > 0) {
          //   position = {
          //     _id: resPerson.data.positions[0]._id,
          //     posName: resPerson.data.positions[0].position_type.name,
          //     posType: resPerson.data.positions[0].position_type.type,
          //     posNumber: resPerson.data.positions[0].number,
          //   }

          //   returnData = [
          //     ...returnData,
          //     {
          //       _id: thisPerson._id,
          //       Prename: thisPerson.Prename,
          //       Name: thisPerson.Name,
          //       Surname: thisPerson.Surname,
          //       ID_Card: thisPerson.ID_Card,
          //       SID_Card: thisPerson.SID_Card,
          //       staff_created: thisPerson.staff_created,
          //       staff_updated: thisPerson.staff_updated,
          //       createdAt: thisPerson.createdAt,
          //       updatedAt: thisPerson.updatedAt,
          //       position: position,
          //       division: resPerson.data.positions[0].division,
          //     },
          //   ]
          // }
          // }
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
  }, [url, userInfo, searchPersonFilter, dispatch])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `people`,
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
                name: `จัดการประวัติกำลังพล`,
                link: `/people`,
              },
            ]}
            current="ค้นหา"
          />

          {!isError.status ? (
            peopleData.length > 0 && (
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
                            {rowIndex + 1}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.position.posNumber}
                          </TableCell>
                          <TableCell align="left">{`${row.Prename} ${row.Name} ${row.Surname}`}</TableCell>
                          <TableCell align="left">
                            {row.position.posType}
                          </TableCell>
                          <TableCell align="left">
                            {row.position.posName}
                          </TableCell>
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

                      navigate(`/people/edit?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon icon={faPen} style={{ marginRight: 5 }} />
                    แก้ไขกำลังพล
                  </MenuItem>
                </Menu>
              </>
            )
          ) : (
            <>
              <Warning
                text={isError.text}
                button={
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => navigate(`/people`)}
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
