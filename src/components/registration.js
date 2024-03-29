import React, { useCallback, useEffect } from "react"
import { useDispatch } from "react-redux"

import { client, gql } from "../functions/apollo-client"

const Registration = () => {
  const dispatch = useDispatch()

  const getServerConfigs = useCallback(async () => {
    try {
      const res = await client().query({
        query: gql`
          query ServerConfigs {
            serverConfigs(
              where: {
                _or: [
                  { name: "online-status" }
                  { name: "online-status-notice" }
                  { name: "open-to-registration" }
                ]
              }
            ) {
              _id
              name
              description
            }
          }
        `,
      })

      const data = res.data.serverConfigs
      const onlineStatusObj = data.find(elem => elem.name === `online-status`)
      const registrationStatusObj = data.find(
        elem => elem.name === `open-to-registration`
      )
      const onlineStatusTextObj = data.find(
        elem => elem.name === `online-status-notice`
      )
      let serverStates = {
        isOnline: false,
        isOpenToRegistration: false,
        notice: ``,
      }

      if (onlineStatusObj !== undefined) {
        serverStates.isOnline =
          onlineStatusObj.description === `yes` ? true : false
      }

      if (registrationStatusObj !== undefined) {
        serverStates.isOpenToRegistration =
          registrationStatusObj.description === `yes` ? true : false
      }

      if (onlineStatusTextObj !== undefined) {
        serverStates.notice = onlineStatusTextObj.description
      }

      dispatch({
        type: `SET_SERVER_STATES`,
        serverStates: {
          isOnline: serverStates.isOnline,
          isOpenToRegistration: serverStates.isOpenToRegistration,
          notice: serverStates.notice,
          isFetched: true,
        },
      })
    } catch (error) {
      console.log(error)
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `ไม่สามารถรับข้อมูลได้`,
          description: `กรุณาลองใหม่อีกครั้ง`,
          variant: `error`,
          confirmText: `เชื่อมต่ออีกครั้ง`,
          callback: () => getServerConfigs(),
        },
      })
    }
  }, [dispatch])

  useEffect(() => {
    getServerConfigs()
  }, [getServerConfigs])

  return <></>
}

export default Registration
