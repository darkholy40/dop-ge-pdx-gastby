import React from "react"
import { navigate } from "gatsby"
import PropTypes from "prop-types"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"

const Flex = styled.div`
  font-size: 1.25rem;
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 2rem;
`

const Previous = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .previous {
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`

const Breadcrumbs = ({ previous, current }) => {
  return (
    <Flex>
      {previous.map((item, index) => {
        return (
          <Previous key={`pre_bread_${index}`}>
            <div
              className="previous"
              role="presentation"
              onClick={() => navigate(`${item.link}`)}
            >
              {item.name}
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{ fontSize: `1rem`, marginLeft: 7, marginRight: 7 }}
            />
          </Previous>
        )
      })}
      <div>{current}</div>
    </Flex>
  )
}

Breadcrumbs.propTypes = {
  previous: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
  current: PropTypes.string,
}

Breadcrumbs.defaultProps = {
  previous: [],
  current: ``,
}

export default Breadcrumbs
