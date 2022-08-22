import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import jwt_decode from "jwt-decode"

import { client, gql } from "../functions/apollo-client"

import useInterval from "../functions/use-interval"

const Jwt = () => {
  const dispatch = useDispatch()
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const [isExpired, setIsExpired] = React.useState(false)

  const fetchSessionTimer = React.useCallback(() => {
    if (token !== ``) {
      const decoded = jwt_decode(token)
      const difference = decoded.exp * 1000 - Date.now()

      const hours = Math.floor(difference / 1000 / 60 / 60)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      console.log({
        hr: `${hours}`,
        min: minutes < 10 ? `0${minutes}` : `${minutes}`,
        sec: seconds < 10 ? `0${seconds}` : `${seconds}`,
      })

      dispatch({
        type: `SET_SESSION_TIMER`,
        sessionTimer: {
          hr: `${hours}`,
          min: minutes < 10 ? `0${minutes}` : `${minutes}`,
          sec: seconds < 10 ? `0${seconds}` : `${seconds}`,
        },
      })

      if (hours <= 0 && minutes <= 0 && seconds <= 0) {
        setIsExpired(true)
      }
    }
  }, [token, dispatch])

  React.useEffect(() => {
    if (token !== ``) {
      const decoded = jwt_decode(token)
      // const decodedHeader = jwt_decode(token, { header: true })

      const expired = Date.now() >= decoded.exp * 1000

      // console.log({
      //   decoded: decoded,
      //   decodedHeader: decodedHeader,
      //   expired: expired,
      // })

      if (expired || isExpired) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เซสชันหมดอายุ`,
            description: `กรุณายืนยันตัวตนเพื่อเข้าใช้งานระบบอีกครั้ง`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => {
              navigate(`/`)

              setIsExpired(false)

              dispatch({
                type: `RESET_SESSION_TIMER`,
              })
            },
          },
        })

        client().mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "auth",
                  description: "token expired",
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

        dispatch({
          type: `SET_TOKEN`,
          token: ``,
        })
      }
    }
  }, [token, userInfo._id, isExpired, dispatch])

  React.useEffect(() => {
    fetchSessionTimer()
  }, [fetchSessionTimer])

  useInterval(
    () => {
      fetchSessionTimer()
    },
    token !== `` ? 1000 : null
  )

  return <></>
}
export default Jwt
