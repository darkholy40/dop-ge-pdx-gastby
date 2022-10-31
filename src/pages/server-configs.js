import React, { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Switch, Button } from "@mui/material"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../functions/apollo-client"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import PageNotFound from "../components/page-not-found"
import { Form, Flex, TextFieldWall } from "../components/styles"
import roleLevel from "../functions/role-level"
import Warning from "../components/warning"

const Container = styled.div`
  box-shadow: rgb(0 0 0 / 24%) 0px 1px 2px;
  border-radius: 8px;
  padding: 32px 24px;
  max-width: 800px;
  margin: auto;
`

const ServerConfigsPage = () => {
  const { token, userInfo, primaryColor } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const dispatch = useDispatch()
  const [firstStrike, setFirstStrike] = useState(false)
  const [error, setError] = useState(``)
  const [serverStatus, setServerStatus] = useState({
    id: ``,
    status: false,
  })
  const [registrationStatus, setRegistrationStatus] = useState({
    id: ``,
    status: false,
  })

  const savePageView = useCallback(() => {
    // Prevent saving a log when switch user to super admin
    if (token !== `` && userInfo._id !== `` && roleLevel(userInfo.role) < 3) {
      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "view",
                description: "server-configs",
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

  const getServerConfigs = useCallback(async () => {
    setError(``)
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
          query ServerConfigs {
            serverConfigs(
              where: {
                _or: [
                  { name: "online-status" }
                  { name: "open-to-registration" }
                  { name: "version" }
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

      setFirstStrike(true)
      if (onlineStatusObj !== undefined) {
        setServerStatus({
          id: onlineStatusObj._id,
          status: onlineStatusObj.description === `yes` ? true : false,
        })
      }

      if (registrationStatusObj !== undefined) {
        setRegistrationStatus({
          id: registrationStatusObj._id,
          status: registrationStatusObj.description === `yes` ? true : false,
        })
      }
    } catch (error) {
      // console.log(error.message)

      switch (error.message) {
        case `Failed to fetch`:
          setError(`Failed to fetch`)
          break

        default:
          setError(error.message)
          break
      }
    }

    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropDialog: {
        open: false,
        title: ``,
      },
    })
  }, [token, dispatch])

  const updateOnlineStatus = useCallback(
    async checked => {
      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropDialog: {
          open: true,
          title: ``,
        },
      })

      try {
        const res = await client(token).mutate({
          mutation: gql`
          mutation UpdateServerConfigs {
            updateServerConfig(input: {
              data: {
                description: "${checked ? `yes` : `no`}"
              },
              where: {
                id: "${serverStatus.id}"
              }
            }) {
              serverConfig {
                _id
                description
              }
            }
          }
        `,
        })

        const updateStatus =
          res.data.updateServerConfig.serverConfig.description === `yes`
            ? true
            : false
        setServerStatus(prev => ({
          ...prev,
          status: updateStatus,
        }))

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "online-status->update => ${
                    checked ? `เปิด` : `ปิด`
                  }",
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
      } catch (error) {
        console.log(error.message)
      }

      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropDialog: {
          open: false,
          title: ``,
        },
      })
    },
    [token, userInfo, dispatch, serverStatus]
  )

  const updateRegistrationStatus = useCallback(
    async checked => {
      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropDialog: {
          open: true,
          title: ``,
        },
      })

      try {
        const res = await client(token).mutate({
          mutation: gql`
          mutation UpdateServerConfigs {
            updateServerConfig(input: {
              data: {
                description: "${checked ? `yes` : `no`}"
              },
              where: {
                id: "${registrationStatus.id}"
              }
            }) {
              serverConfig {
                _id
                description
              }
            }
          }
        `,
        })

        const updateStatus =
          res.data.updateServerConfig.serverConfig.description === `yes`
            ? true
            : false
        setRegistrationStatus(prev => ({
          ...prev,
          status: updateStatus,
        }))

        client(token).mutate({
          mutation: gql`
            mutation CreateLog {
              createLog(input: {
                data: {
                  action: "action",
                  description: "open-for-registration->update => ${
                    checked ? `เปิด` : `ปิด`
                  }",
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
      } catch (error) {
        console.log(error.message)
      }

      dispatch({
        type: `SET_BACKDROP_OPEN`,
        backdropDialog: {
          open: false,
          title: ``,
        },
      })
    },
    [token, userInfo, dispatch, registrationStatus]
  )

  useEffect(() => {
    dispatch({
      type: `SET_CURRENT_PAGE`,
      currentPage: `server-configs`,
    })
  }, [dispatch])

  useEffect(() => {
    savePageView()
  }, [savePageView])

  useEffect(() => {
    if (roleLevel(userInfo.role) >= 2 && token !== ``) {
      getServerConfigs()
    }
  }, [getServerConfigs, token, userInfo.role])

  return (
    <Layout>
      {token !== `` && roleLevel(userInfo.role) >= 2 ? (
        <>
          <Seo title="การตั้งค่า Server" />
          <Breadcrumbs current="การตั้งค่า Server" />

          {firstStrike && (
            <Container>
              <Form
                onSubmit={e => e.preventDefault()}
                style={{ maxWidth: 400 }}
              >
                <p>
                  อนุญาตให้ลงชื่อเข้าใช้งาน
                  <span
                    style={{
                      color: `rgba(0, 0, 0, 0.55)`,
                      marginLeft: `0.5rem`,
                    }}
                  >
                    (เปิด / ปิดเซิร์ฟเวอร์)
                  </span>
                </p>
                <TextFieldWall
                  style={{
                    padding: `6px 6px 6px 15px`,
                    marginBottom: `1rem`,
                    backgroundColor: serverStatus.status
                      ? primaryColor[50]
                      : `rgba(0, 0, 0, 0)`,
                    border: serverStatus.status
                      ? `1px solid ${primaryColor[500]}`
                      : `1px solid rgba(0, 0, 0, 0.24)`,
                  }}
                  role="presentation"
                >
                  <Flex
                    style={{ width: `100%`, justifyContent: `space-between` }}
                  >
                    <div style={{ color: `rgba(0, 0, 0, 0.85)` }}>
                      เปิดให้ลงชื่อเข้าใช้งาน
                    </div>
                    <Switch
                      checked={serverStatus.status}
                      onChange={(_, newVal) => updateOnlineStatus(newVal)}
                    />
                  </Flex>
                </TextFieldWall>

                <p>อนุญาตให้ลงทะเบียนผู้ใช้งาน</p>
                <TextFieldWall
                  style={{
                    padding: `6px 6px 6px 15px`,
                    marginBottom: `1rem`,
                    backgroundColor: registrationStatus.status
                      ? primaryColor[50]
                      : `rgba(0, 0, 0, 0)`,
                    border: registrationStatus.status
                      ? `1px solid ${primaryColor[500]}`
                      : `1px solid rgba(0, 0, 0, 0.24)`,
                  }}
                  role="presentation"
                >
                  <Flex
                    style={{ width: `100%`, justifyContent: `space-between` }}
                  >
                    <div style={{ color: `rgba(0, 0, 0, 0.85)` }}>
                      เปิดให้ลงทะเบียน
                    </div>
                    <Switch
                      checked={registrationStatus.status}
                      onChange={(_, newVal) => updateRegistrationStatus(newVal)}
                    />
                  </Flex>
                </TextFieldWall>
              </Form>
            </Container>
          )}

          {error !== `` && (
            <Warning
              text={(() => {
                switch (error) {
                  case `Failed to fetch`:
                    return `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้`

                  default:
                    return `พบข้อผิดพลาด`
                }
              })()}
              button={
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => getServerConfigs()}
                >
                  <FontAwesomeIcon
                    icon={faRedoAlt}
                    style={{ marginRight: 5 }}
                  />
                  <span>ลองใหม่อีกครั้ง</span>
                </Button>
              }
            />
          )}
        </>
      ) : (
        <PageNotFound />
      )}
    </Layout>
  )
}

export default ServerConfigsPage
