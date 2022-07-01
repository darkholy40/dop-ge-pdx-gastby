import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import styled from "styled-components"

import displaySessionTimer from "../functions/display-session-timer"

const Wall = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 4rem;
`

const Timer = styled.div`
  color: #000;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  user-select: none;
  cursor: pointer;

  > span {
    &.l {
      font-size: 0.75rem;
    }

    font-size: 1rem;
  }

  @media (max-width: 599px) {
    > span {
      &.l {
        font-size: 0.6rem;
      }

      font-size: 0.85rem;
    }
  }
`

const SessionTimer = () => {
  const { token } = useSelector(({ mainReducer }) => mainReducer)
  const { sessionTimer } = useSelector(({ timerReducer }) => timerReducer)
  const [sessionTimerClassname, setSessionTimerClassname] = useState(``)

  useEffect(() => {
    if (token !== ``) {
      setSessionTimerClassname(`active`)
    } else {
      setSessionTimerClassname(``)
    }
  }, [token])

  return (
    <Wall>
      <Timer className={sessionTimerClassname}>
        <span className="l">เซสชันคงเหลือ</span>
        <span className="r">{displaySessionTimer(sessionTimer)}</span>
      </Timer>
    </Wall>
  )
}

export default SessionTimer
