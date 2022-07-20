import React from "react"
import { useSelector, useDispatch } from "react-redux"

import { client, gql } from "../functions/apollo-client"

import roleLevel from "../functions/role-level"

const StaticTags = () => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { tags } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()

  const fetchStaticTags = React.useCallback(async () => {
    let returnArr = []

    try {
      const res = await client(token).query({
        query: gql`
          query ServerConfigs {
            serverConfigs {
              _id
              name
              description
            }
          }
        `,
      })

      const data = res.data.serverConfigs
      const newTags = {
        positionTypes:
          data.find(elem => elem.name === `positionTypes`) !== undefined
            ? data.find(elem => elem.name === `positionTypes`).description
            : ``,
        units:
          data.find(elem => elem.name === `units`) !== undefined
            ? data.find(elem => elem.name === `units`).description
            : ``,
        locations:
          data.find(elem => elem.name === `locations`) !== undefined
            ? data.find(elem => elem.name === `locations`).description
            : ``,
        educationLevels:
          data.find(elem => elem.name === `educationLevels`) !== undefined
            ? data.find(elem => elem.name === `educationLevels`).description
            : ``,
        educationNames:
          data.find(elem => elem.name === `educationNames`) !== undefined
            ? data.find(elem => elem.name === `educationNames`).description
            : ``,
        educationalInstitutions:
          data.find(elem => elem.name === `educationalInstitutions`) !==
          undefined
            ? data.find(elem => elem.name === `educationalInstitutions`)
                .description
            : ``,
        countries:
          data.find(elem => elem.name === `countries`) !== undefined
            ? data.find(elem => elem.name === `countries`).description
            : ``,
        decorations:
          data.find(elem => elem.name === `decorations`) !== undefined
            ? data.find(elem => elem.name === `decorations`).description
            : ``,
        roles:
          data.find(elem => elem.name === `roles`) !== undefined
            ? data.find(elem => elem.name === `roles`).description
            : ``,
      }

      if (tags.positionTypes !== newTags.positionTypes) {
        returnArr = [
          ...returnArr,
          {
            name: `positionTypes`,
            newTags: newTags.positionTypes,
          },
        ]
      }

      if (roleLevel(userInfo.role) >= 2) {
        if (tags.units !== newTags.units) {
          returnArr = [
            ...returnArr,
            {
              name: `units`,
              newTags: newTags.units,
            },
          ]
        }

        if (tags.roles !== newTags.roles) {
          returnArr = [
            ...returnArr,
            {
              name: `roles`,
              newTags: newTags.roles,
            },
          ]
        }
      }

      if (tags.locations !== newTags.locations) {
        returnArr = [
          ...returnArr,
          {
            name: `locations`,
            newTags: newTags.locations,
          },
        ]
      }

      if (tags.educationLevels !== newTags.educationLevels) {
        returnArr = [
          ...returnArr,
          {
            name: `educationLevels`,
            newTags: newTags.educationLevels,
          },
        ]
      }

      if (tags.educationNames !== newTags.educationNames) {
        returnArr = [
          ...returnArr,
          {
            name: `educationNames`,
            newTags: newTags.educationNames,
          },
        ]
      }

      if (tags.educationalInstitutions !== newTags.educationalInstitutions) {
        returnArr = [
          ...returnArr,
          {
            name: `educationalInstitutions`,
            newTags: newTags.educationalInstitutions,
          },
        ]
      }

      if (tags.countries !== newTags.countries) {
        returnArr = [
          ...returnArr,
          {
            name: `countries`,
            newTags: newTags.countries,
          },
        ]
      }

      if (tags.decorations !== newTags.decorations) {
        returnArr = [
          ...returnArr,
          {
            name: `decorations`,
            newTags: newTags.decorations,
          },
        ]
      }

      dispatch({
        type: `SET_SHOULD_UPDATE_STATIC`,
        shouldUpdateStatic: returnArr,
      })
      dispatch({
        type: `SET_SERVER_CONFIG`,
        serverConfigs: data,
      })
    } catch (error) {
      console.log(error)
    }
  }, [token, userInfo.role, tags, dispatch])

  React.useMemo(() => {
    // console.log(`Mount StaticTags component`)
    if (token !== ``) {
      fetchStaticTags()
    }
  }, [fetchStaticTags, token])

  return <></>
}

export default StaticTags
