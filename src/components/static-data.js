import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"

import { client, gql } from "../functions/apollo-client"

const StaticData = () => {
  const { token } = useSelector(({ mainReducer }) => mainReducer)
  const dispatch = useDispatch()
  const [isFetchingComplete, setIsFetchingComplete] = useState({
    positionTypes: false,
    positionNames: false,
    units: false,
  })

  const getPositionTypes = useCallback(async () => {
    try {
      // รายชื่อ กลุ่มงาน
      const res = await client(token).query({
        query: gql`
          query PositionTypes {
            positionTypes(where: { order: 1 }) {
              _id
              type
              name
              order
            }
          }
        `,
      })

      let positionTypeData = []
      for (let positionType of res.data.positionTypes) {
        positionTypeData = [
          ...positionTypeData,
          {
            _id: positionType._id,
            type: positionType.type,
          },
        ]
      }

      dispatch({
        type: `SET_POSITION_TYPES`,
        positionTypes: positionTypeData,
      })
      setIsFetchingComplete(prev => ({
        ...prev,
        positionTypes: true,
      }))
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPositionTypes(),
          },
        })
      }
    }
  }, [token, dispatch])

  const getPositionName = useCallback(async () => {
    let lap = 0

    try {
      const res = await client(token).query({
        query: gql`
          query PositionTypesCount {
            positionTypesConnection {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.positionTypesConnection.aggregate.totalCount
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getPositionName(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query PositionNames {
              positionTypes(limit: 100, start: ${i * 100}) {
                _id
                type
                name
                order
              }
            }
          `,
        })

        for (let thisPositionType of res.data.positionTypes) {
          returnData = [...returnData, thisPositionType]
        }
      }

      dispatch({
        type: `SET_POSITION_NAMES`,
        positionNames: returnData,
      })
      setIsFetchingComplete(prev => ({
        ...prev,
        positionNames: true,
      }))
    }
  }, [token, dispatch])

  const getUnits = useCallback(async () => {
    let lap = 0

    try {
      const res = await client(token).query({
        query: gql`
          query DivisionsCount {
            divisionsConnection {
              aggregate {
                count
                totalCount
              }
            }
          }
        `,
      })

      const totalCount = res.data.divisionsConnection.aggregate.totalCount
      lap = Math.ceil(totalCount / 100)
    } catch (error) {
      // console.log(error.message)

      if (error.message === `Failed to fetch`) {
        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `การเชื่อมต่อไม่เสถียร`,
            description: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
            variant: `error`,
            confirmText: `ลองอีกครั้ง`,
            callback: () => getUnits(),
          },
        })
      }
    }

    if (lap > 0) {
      let returnData = []
      for (let i = 0; i < lap; i++) {
        const res = await client(token).query({
          query: gql`
            query Divisions {
              divisions(limit: 100, start: ${i * 100}) {
                _id
                division1
                division2
                division3
              }
            }
          `,
        })

        for (let division of res.data.divisions) {
          returnData = [...returnData, division]
        }
      }

      dispatch({
        type: `SET_UNITS`,
        units: returnData,
      })
      setIsFetchingComplete(prev => ({
        ...prev,
        units: true,
      }))
    }
  }, [token, dispatch])

  useEffect(() => {
    if (token !== `` && !isFetchingComplete.positionTypes) {
      getPositionTypes()
    }
  }, [token, isFetchingComplete.positionTypes, getPositionTypes])

  useEffect(() => {
    if (token !== `` && !isFetchingComplete.positionNames) {
      getPositionName()
    }
  }, [token, isFetchingComplete.positionNames, getPositionName])

  useEffect(() => {
    if (token !== `` && !isFetchingComplete.units) {
      getUnits()
    }
  }, [token, isFetchingComplete.units, getUnits])

  return <></>
}

export default StaticData
