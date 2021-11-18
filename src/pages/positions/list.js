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

  const getPosition = useCallback(async () => {
    const client = new ApolloClient({
      uri: `${url}/graphql`,
      cache: new InMemoryCache(),
    })
    let filter = ``
    let whereCondition = ``
    let returnData = []

    if (
      searchPositionFilter.posName !== `` ||
      searchPositionFilter.posType !== `` ||
      searchPositionFilter.posNumber !== ``
    ) {
      filter = `${
        searchPositionFilter.posName !== ``
          ? `Pos_Name_contains: "${searchPositionFilter.posName}"`
          : ``
      }
        ${
          searchPositionFilter.posType !== ``
            ? `Pos_Type: "${searchPositionFilter.posType}"`
            : ``
        }
        ${
          searchPositionFilter.posNumber !== ``
            ? `Pos_Number_contains: "${searchPositionFilter.posNumber}"`
            : ``
        }`
    }

    if (userInfo.role.name === `Administrator`) {
      whereCondition = `where: {
        ${filter}
      }`
    } else {
      whereCondition = `where: {
        staff_created: "${userInfo._id}"
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
            positions(${whereCondition}) {
              _id
              Pos_Name
              Pos_Type
              Pos_Number
              Pos_Open
              Pos_South
              staff_created
              staff_updated
              published_at
              createdAt
              updatedAt
              person_id
            }
          }
        `,
      })

      if (res.data.positions.length > 0) {
        for (let thisPos of res.data.positions) {
          let person = {
            prename: `-`,
            name: ``,
            surname: ``,
          }
          if (thisPos.person_id !== ``) {
            const resPerson = await client.query({
              query: gql`
                query Person {
                  person(id: "${thisPos.person_id}") {
                    _id
                    Prename
                    Name
                    Surname
                  }
                }
              `,
            })

            person = {
              prename: resPerson.data.person.Prename,
              name: resPerson.data.person.Name,
              surname: resPerson.data.person.Surname,
            }
          }

          returnData = [
            ...returnData,
            {
              _id: thisPos._id,
              Pos_Name: thisPos.Pos_Name,
              Pos_Type: thisPos.Pos_Type,
              Pos_Number: thisPos.Pos_Number,
              Pos_Open: thisPos.Pos_Open,
              Pos_South: thisPos.Pos_South,
              staff_created: thisPos.staff_created,
              staff_updated: thisPos.staff_updated,
              published_at: thisPos.published_at,
              createdAt: thisPos.createdAt,
              updatedAt: thisPos.updatedAt,
              person: person,
            },
          ]
        }

        // console.log(returnData)
        setPosData(returnData)
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
  }, [url, userInfo, searchPositionFilter, dispatch])

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `positions`,
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
                name: `คลังตำแหน่ง`,
                link: `/positions`,
              },
            ]}
            current="ค้นหา"
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
                            {rowIndex + 1}
                          </TableCell>
                          <TableCell align="left" sx={{ minWidth: 100 }}>
                            {row.Pos_Name}
                          </TableCell>
                          <TableCell align="left">{row.Pos_Type}</TableCell>
                          <TableCell align="left">{row.Pos_Number}</TableCell>
                          <TableCell align="left">{`${row.person.prename} ${row.person.name} ${row.person.surname}`}</TableCell>
                          <TableCell align="center">
                            {row.Pos_South && (
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
                            {row.Pos_Open && (
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
                >
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)

                      navigate(`/positions/edit?id=${currentRow._id}`)
                    }}
                    disableRipple
                  >
                    <FontAwesomeIcon icon={faPen} style={{ marginRight: 5 }} />
                    แก้ไข
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
