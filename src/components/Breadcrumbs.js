import React from "react"
import { navigate } from "gatsby"
import { useSelector } from "react-redux"
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

  width: calc(100% - 32px);
  padding: 12px 16px;
  background-color: ${({ primaryColor }) => primaryColor[50]};
  border-radius: 4px;
  transform: skewX(-10deg);
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

const Text = styled.div`
  transform: skewX(10deg);

  + svg {
    transform: skewX(10deg);
  }
`

const Breadcrumbs = ({ previous, current }) => {
  const { primaryColor } = useSelector(state => state)

  return (
    <Flex primaryColor={primaryColor}>
      {previous.map((item, index) => {
        return (
          <Previous key={`pre_bread_${index}`}>
            <Text
              className="previous"
              role="presentation"
              onClick={() => navigate(`${item.link}`)}
            >
              {item.name}
            </Text>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{ fontSize: `1rem`, marginLeft: 7, marginRight: 7 }}
            />
          </Previous>
        )
      })}
      <Text>{current}</Text>
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
