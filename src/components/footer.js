import React, { useCallback, useEffect } from "react"
import styled from "styled-components"
import { useSelector, useDispatch } from "react-redux"
import useInterval from "../functions/use-interval"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDay, faClock } from "@fortawesome/free-solid-svg-icons"

import months from "../static/months"

const FooterContainer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  position: relative;
  opacity: 1;
  background-color: #efefef;
  padding: 0.75rem 1rem;

  &.active {
    margin-left: 240px;

    @media (max-width: 899px) {
      margin-left: auto;
    }
  }

  @media (max-width: 599px) {
    padding-top: 0.5rem;
    padding-bottom: 0.75rem;
  }
`

const FooterRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 960px;
  color: rgb(0, 0, 0);
  line-height: 28px;
  transition: 0.3s;

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: center;
  }
`

const Block = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .date {
    margin-right: 2rem;

    svg {
      margin-right: 5px;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  .timer {
    width: 85px;

    svg {
      margin-right: 5px;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: flex-start;

    .date {
      margin-right: 0;

      svg {
        margin-right: 11px;
      }
    }

    .timer {
      svg {
        margin-right: 8px;
      }
    }
  }
`

const Footer = () => {
  const { token, tutorialCount, currentPage } = useSelector(
    ({ mainReducer }) => mainReducer
  )
  const { newDate } = useSelector(({ clockReducer }) => clockReducer)
  const dispatch = useDispatch()

  const renderDate = () => {
    return `วันที่ ${newDate.date} ${months.long[newDate.month].th} ${
      newDate.year
    }`
  }

  const renderTimer = () => {
    const hour = parseInt(newDate.hour) < 10 ? `0${newDate.hour}` : newDate.hour
    const minute =
      parseInt(newDate.minute) < 10 ? `0${newDate.minute}` : newDate.minute
    const second =
      parseInt(newDate.second) < 10 ? `0${newDate.second}` : newDate.second

    return `${hour}:${minute}:${second}`
  }

  const fetchTimer = useCallback(() => {
    dispatch({ type: `FETCH_CLOCK` })
  }, [dispatch])

  useInterval(() => {
    fetchTimer()
  }, 1000)

  useEffect(() => {
    fetchTimer()
  }, [fetchTimer])

  return (
    <FooterContainer
      className={
        token !== `` && tutorialCount === 4 && currentPage !== `home`
          ? `active`
          : ``
      }
    >
      <FooterRow>
        <Block>
          <div className="date">
            <FontAwesomeIcon icon={faCalendarDay} />
            {renderDate()}
          </div>
          <div className="timer">
            <FontAwesomeIcon icon={faClock} />
            {renderTimer()}
          </div>
        </Block>
      </FooterRow>
    </FooterContainer>
  )
}

export default Footer
