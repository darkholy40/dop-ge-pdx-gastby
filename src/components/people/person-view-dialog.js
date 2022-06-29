import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import { Dialog, DialogTitle, DialogActions, IconButton } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;
  font-family: var(--main-font-family);

  > p {
    font-size: 1rem;
    margin-top: 0;
  }
`

const PersonViewDialog = ({ personId, open, title, callback }) => {
  const { token } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()
  const [data, setData] = useState(null)
  const [progressStatus, setProgressStatus] = useState({
    status: `loading`,
    text: `กำลังโหลดข้อมูล`,
  })

  const getPerson = useCallback(async () => {
    let returnData = {
      person: null,
      position: null,
    }

    if (personId === `0`) {
      setProgressStatus({
        type: `not-found`,
        text: `ไม่พบข้อมูลหน้านี้`,
      })

      return 0
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: true,
        title: ``,
      },
    })

    try {
      const res = await client(token).query({
        query: gql`
          query Person {
            person(id: "${personId}") {
              _id
              Prename
              Name
              Surname
              ID_Card
              SID_Card
              Gender
              BirthDate
              MarriedStatus
              Telephone
              Address
              Emergency_Name
              Emergency_Number
              StartDate
              MovementType
              Outline
              RewardType1
              RewardType2
              RewardType3
              ContactCnt
              Mission
              CurrentContactStart
              CurrentContactEnd
              Guilty
              Punish
              PercentSalary
              ScoreKPI
              ScoreCompetence
              StatusDisability
              skills
              staff_created
              staff_updated
              type
              location {
                _id
                province
                district
                subdistrict
                zipcode
              }
              education_level {
                _id
                code
                name
              }
              education_name {
                _id
                code
                short_name
                full_name
              }
              educational_institution {
                _id
                code
                name
              }
              country {
                _id
                code
                name
              }
              decoration {
                _id
                short_name
                full_name
                eng_name
              }
            }
          }
        `,
      })

      if (res.data.person !== null) {
        returnData.person = res.data.person
      } else {
        setProgressStatus({
          type: `not-found`,
          text: `ไม่พบข้อมูลหน้านี้`,
        })
      }
    } catch (error) {
      console.log(error)

      setProgressStatus({
        type: `connection`,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได`,
      })
    }

    try {
      const res = await client(token).query({
        query: gql`
          query Position {
            positions(where: {
              person: "${personId}"
            }) {
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
                _id
                division1
                division2
                division3
              }
            }
          }
        `,
      })

      if (res) {
        returnData.position = res.data.positions[0]
      }
    } catch (error) {
      console.log(error)

      setProgressStatus({
        type: `connection`,
        text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได`,
      })
    }

    console.log(returnData)
    if (returnData.person !== null && returnData.position !== null) {
      setData(returnData)
      setProgressStatus({
        status: ``,
        text: ``,
      })
    } else {
      setProgressStatus({
        status: `error`,
        text: `ข้อมูลผิดพลาดผิดพลาด`,
      })
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, personId, dispatch])

  useEffect(() => {
    if(open) {
      getPerson()
    }
  }, [open, getPerson])

  return (
    <>
      <Dialog fullWidth maxWidth="lg" open={open}>
        <DialogTitle>{title}</DialogTitle>
        <Content>
          {data !== null && progressStatus.status === `` && (
            <>
              <p>{data.person.Prename}</p>
              <p>{data.person.Name}</p>
              <p>{data.person.Surname}</p>
            </>
          )}
        </Content>
        <DialogActions sx={{ position: `absolute`, top: 0, right: 0 }}>
          <IconButton
            style={{ width: 40, height: 40 }}
            onClick={() => callback()}
          >
            <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20 }} />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

PersonViewDialog.propTypes = {
  personId: PropTypes.string,
  open: PropTypes.bool,
  title: PropTypes.string,
  callback: PropTypes.func,
}

PersonViewDialog.defaultProps = {
  personId: ``,
  open: false,
  title: `ดูประวัติกำลังพล`,
  callback: () => {},
}

export default PersonViewDialog
