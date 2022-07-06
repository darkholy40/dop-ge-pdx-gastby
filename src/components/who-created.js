import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import styled from "styled-components"
import { Divider } from "@mui/material"

import { client, gql } from "../functions/apollo-client"

import renderFullname from "../functions/render-fullname"
import renderTableDate from "../functions/render-table-date"

const Line = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`
const Label = styled.span`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`

const WhoCreated = ({ whoCreated, whoUpdated }) => {
  const { token } = useSelector(({ mainReducer }) => mainReducer)
  const [userWhoCreated, setUserWhoCreated] = useState({
    data: null,
    date: null,
  })
  const [userWhoUpdated, setUserWhoUpdated] = useState({
    data: null,
    date: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      let data = null

      if (whoCreated.id !== ``) {
        try {
          const resStaffCreated = await client(token).query({
            query: gql`
              query UserWhoCreated {
                user(id: "${whoCreated.id}") {
                  rank
                  name
                  surname
                }
              }
            `,
          })

          data = resStaffCreated.data.user
        } catch (error) {
          // console.log(error.message)
        }
      }

      setUserWhoCreated({
        data: data,
        date: whoCreated.date,
      })
    }

    if (whoCreated !== undefined) {
      fetchData()
    }
  }, [token, whoCreated])

  useEffect(() => {
    const fetchData = async () => {
      let data = null

      if (whoUpdated.id !== ``) {
        try {
          const resStaffUpdated = await client(token).query({
            query: gql`
              query UserWhoUpdated {
                user(id: "${whoUpdated.id}") {
                  rank
                  name
                  surname
                }
              }
            `,
          })

          data = resStaffUpdated.data.user
        } catch (error) {
          // console.log(error.message)
        }
      }

      setUserWhoUpdated({
        data: data,
        date: whoUpdated.date,
      })
    }

    if (whoUpdated !== undefined) {
      fetchData()
    }
  }, [token, whoUpdated])

  return (
    (whoCreated !== undefined || whoUpdated !== undefined) && (
      <div
        style={{
          width: `100%`,
          display: `flex`,
          justifyContent: `center`,
          alignItems: `center`,
        }}
      >
        <div
          style={{
            display: `flex`,
            flexDirection: `column`,
            border: `1px solid rgba(0, 0, 0, 0.18)`,
            borderRadius: `12px`,
            padding: `0.5rem 1rem`,
            width: `100%`,
            maxWidth: `360px`,
          }}
        >
          {whoCreated !== undefined && (
            <Line>
              <Label>เจ้าหน้าที่ผู้เพิ่มข้อมูล</Label>
              <span>
                {renderFullname(userWhoCreated.data) || `ผู้ดูแลระบบ`}
              </span>
              <span
                style={{
                  color: `rgba(0, 0, 0, 0.56)`,
                  fontSize: `0.79rem`,
                  fontStyle: `italic`,
                }}
              >
                {renderTableDate(userWhoCreated.date, `full-datetime`)}
              </span>
            </Line>
          )}
          {whoCreated !== undefined && whoUpdated !== undefined && (
            <Divider sx={{ width: `100%` }} />
          )}
          {whoUpdated !== undefined && (
            <Line>
              <Label>เจ้าหน้าที่ผู้แก้ไขข้อมูลล่าสุด</Label>
              <span>
                {renderFullname(userWhoUpdated.data) || `ผู้ดูแลระบบ`}
              </span>
              <span
                style={{
                  color: `rgba(0, 0, 0, 0.56)`,
                  fontSize: `0.79rem`,
                  fontStyle: `italic`,
                }}
              >
                {renderTableDate(userWhoUpdated.date, `full-datetime`)}
              </span>
            </Line>
          )}
        </div>
      </div>
    )
  )
}

WhoCreated.propTypes = {
  whoCreated: PropTypes.shape({
    id: PropTypes.string,
    date: PropTypes.object,
  }),
  whoUpdated: PropTypes.shape({
    id: PropTypes.string,
    date: PropTypes.object,
  }),
}

export default WhoCreated
