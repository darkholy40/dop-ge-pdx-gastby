import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import styled from "styled-components"

import displaySessionTimer from "../functions/display-session-timer"

const Timer = styled.div`
  position: absolute;
  top: 3.5rem;
  right: 1.5rem;
  color: #000;
  padding: 5px 10px;
  border-radius: 8px;
  box-shadow: rgb(0 0 0 / 10%) 0px 10px 24px;
  opacity: 0;
  transition: 0.75s ease-in;

  &.active {
    opacity: 0.25;

    @media (hover: hover) {
      &:hover {
        background-color: #fff;
        transition: 0.025s ease-in;
        opacity: 1;
      }
    }
  }

  > span.l {
    margin-right: 5px;
  }

  @media (max-width: 599px) {
    display: flex;
    flex-direction: column;

    > span {
      &.l {
        font-size: 0.5rem;
      }

      font-size: 0.75rem;
    }
  }
`

const SessionTimer = () => {
  const { token, sessionTimer } = useSelector(state => state)
  const [sessionTimerClassname, setSessionTimerClassname] = useState(``)

  useEffect(() => {
    if (token !== ``) {
      setSessionTimerClassname(`active`)
    } else {
      setSessionTimerClassname(``)
    }
  }, [token])

  return (
    <Timer className={sessionTimerClassname}>
      <span className="l">เซสชันคงเหลือ</span>
      <span className="r">{displaySessionTimer(sessionTimer)}</span>
    </Timer>
  )
}

export default SessionTimer
