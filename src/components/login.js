import React, { useState } from "react"
import styled from "styled-components"
import { useSelector, useDispatch } from "react-redux"
import { TextField, InputAdornment, Button, Alert } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

import Image from "./image"

const Title = styled.p`
  font-size: 1.5rem;
  text-align: center;
`

const Flex = styled.div`
  width: calc(100% - 1rem);
  margin: auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: rgb(0 0 0 / 10%) 0px 2px 4px, rgb(0 0 0 / 10%) 0px 8px 16px;

  @media (max-width: 991px) {
    flex-direction: column;
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: row;
`

const Row = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 2.5rem;
`

const LogoContainer = styled.div`
  max-width: 150px;
  margin: auto;

  @media (max-width: 991px) {
    margin-top: 1.5rem;
  }
`

const IndexPage = () => {
  const dispatch = useDispatch()
  const { url, userInfo } = useSelector(state => state)
  const [usernameInput, setUsernameInput] = useState(userInfo.username)
  const [passwordInput, setPasswordInput] = useState(``)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState({
    status: false,
    text: ``,
  })

  const goLogin = async () => {
    setIsError({
      status: false,
      text: ``,
    })
    setIsLoading(true)
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: true,
    })

    try {
      const res = await axios.post(`${url}/auth/local`, {
        identifier: usernameInput,
        password: passwordInput,
      })

      // console.log(res)

      switch (res.status) {
        case 200:
          // use setTimeout() to prevent "Can't perform a React state update on an unmounted component"
          setTimeout(() => {
            dispatch({
              type: `SET_TOKEN`,
              token: res.data.jwt,
            })

            dispatch({
              type: `SET_USER_INFO`,
              userInfo: res.data.user,
            })
          }, 0)
          break

        default:
          setIsError({
            status: true,
            text: `Error - ${res.status}`,
          })
          break
      }
    } catch (error) {
      console.log(error)

      const status = error.response !== undefined ? error.response.status : 0

      switch (status) {
        case 400:
          setIsError({
            status: true,
            text: `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง`,
          })
          break

        default:
          setIsError({
            status: true,
            text: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้`,
          })
          break
      }
    }

    setIsLoading(false)
    dispatch({
      type: `SET_BACKDROP_OPEN`,
      backdropOpen: false,
    })
  }

  return (
    <>
      <Title>ลงชื่อเข้าใช้งานระบบ</Title>
      <form
        style={{
          maxWidth: `960px`,
          margin: `auto`,
        }}
        onSubmit={e => {
          e.preventDefault()
          goLogin()
        }}
      >
        <Flex>
          <Column>
            <LogoContainer>
              <Image src="icon.png" />
            </LogoContainer>
          </Column>
          <Column>
            <Row>
              <TextField
                style={{
                  width: `100%`,
                  marginBottom: `1rem`,
                }}
                id="uname"
                label="ชื่อผู้ใช้งาน"
                type="text"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faUser} style={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                disabled={isLoading}
              />
              <TextField
                style={{
                  width: `100%`,
                  marginBottom: `1.5rem`,
                }}
                id="pwd"
                label="รหัสผ่าน"
                type="password"
                autoComplete="true"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faLock} style={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                disabled={isLoading}
              />
              <Button
                style={{
                  width: `100%`,
                }}
                type="submit"
                color="primary"
                variant="contained"
                size="large"
                disabled={
                  usernameInput === `` || passwordInput === `` || isLoading
                }
              >
                {!isLoading ? (
                  <span>เข้าสู่ระบบ</span>
                ) : (
                  <span>กำลังเข้าสู่ระบบ...</span>
                )}
              </Button>
              {isError.status && (
                <Alert
                  sx={{ marginTop: `1rem`, animation: `fadein 0.3s` }}
                  severity="error"
                >
                  {isError.text}
                </Alert>
              )}
            </Row>
          </Column>
        </Flex>
      </form>
    </>
  )
}

export default IndexPage
