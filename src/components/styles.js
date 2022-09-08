import React from "react"
import { useSelector } from "react-redux"
import PropTypes from "prop-types"
import styled from "styled-components"
import { blue } from "@mui/material/colors"

export const Link = styled.a`
  text-decoration: none;
  color: ${({ primaryColor }) =>
    primaryColor !== undefined ? primaryColor[500] : blue[500]};
  cursor: pointer;
  transition: color 0.1s;

  @media (hover: hover) {
    &:hover {
      color: ${({ primaryColor }) =>
        primaryColor !== undefined ? primaryColor[500] : blue[500]};
    }

    &:active {
      color: ${({ primaryColor }) =>
        primaryColor !== undefined ? primaryColor[700] : blue[700]};
    }
  }
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 800px;
`

export const SearchButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  .MuiButton-root {
    width: 100px;
    height: 100px;
    border-radius: 100%;
  }
`

export const Flex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

export const DisabledBlock = styled.div`
  border-radius: 5px;
  transition: background-color 0.3s;

  &.disabled {
    opacity: 0.5;
    background-color: rgba(0, 0, 0, 0.25);
  }
`

export const TextFieldWall = styled.div`
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const CheckCircleFlex = styled.div`
  border-radius: 0 5px 5px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.24);
  border-right: 1px solid rgba(0, 0, 0, 0.24);
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);
  height: 56px;
  width: 40px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ColorButtonStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  .row {
    width: 100%;
    max-width: ${({ width }) => width};
    user-select: none;
    border-radius: 8px;

    > .button {
      height: ${({ height }) => height};
      padding: 8px 24px;
      border: 1px solid rgba(0, 0, 0, 0.24);
      border-radius: 8px;
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: flex-start;
      transition: background-color 0.2s, color 0.2s;

      > {
        svg {
          font-size: 1.5rem;
          margin-right: 8px;
          min-width: 35px;
        }

        div {
          display: flex;
          flex-direction: column;

          .desc {
            color: rgba(0, 0, 0, 0.75);
            font-size: 0.75rem;
            transition: color 0.2s;
          }
        }
      }

      @media (hover: hover) {
        &:hover {
          background-color: ${({ primaryColor }) => primaryColor[700]};
          color: #fff;
          transition: background-color 0.1s, color 0.1s;

          > div .desc {
            color: rgba(255, 255, 255, 0.75);
            transition: color 0.1s;
          }
        }
      }

      &:active {
        background-color: ${({ primaryColor }) => primaryColor[900]};
        color: #fff;

        > div .desc {
          color: rgba(255, 255, 255, 0.75);
        }
      }

      &.active {
        background-color: ${({ primaryColor }) => primaryColor[700]};
        color: #fff;

        > div .desc {
          color: rgba(255, 255, 255, 0.75);
        }
      }
    }
  }
`

export const ColorButton = ({
  style,
  width,
  height,
  onClick,
  icon,
  title,
  description,
  href,
}) => {
  const { primaryColor } = useSelector(({ mainReducer }) => mainReducer)

  const Content = () => (
    <div className="row">
      <div className="button" role="presentation" onClick={onClick}>
        {icon !== undefined && icon}
        <div>
          <span>{title}</span>
          {description !== undefined && (
            <span className="desc">{description}</span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ColorButtonStyled
      primaryColor={primaryColor}
      width={width}
      height={height}
      style={style}
    >
      {href !== undefined ? (
        <a
          style={{
            textDecoration: `none`,
            color: `unset`,
            width: `100%`,
            maxWidth: 800,
            borderRadius: `8px`,
          }}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          <Content />
        </a>
      ) : (
        <Content />
      )}
    </ColorButtonStyled>
  )
}

ColorButton.propTypes = {
  style: PropTypes.object,
  width: PropTypes.string,
  height: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  href: PropTypes.string,
}

ColorButton.defaultProps = {
  width: `300px`,
  height: `50px`,
  onClick: () => {},
}

export const TextFieldDummy = {
  Line: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Label: styled.span`
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.5);
    margin-bottom: 0.5rem;
  `,
}

export const TextFieldDummyOutlined = {
  Line: styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.18);
    border-radius: 12px;
    padding: 0.5rem 1rem;
  `,
  Label: styled.span`
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.5);
    margin-bottom: 0.5rem;
  `,
}

export const FilterContent = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 1rem;
    margin: 0;

    p {
      margin: 0;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 360px;
    padding: 1rem;

    .MuiFormControl-root.MuiTextField-root {
      width: 100%;

      &:nth-child(n + 2) {
        margin-top: 1rem;
      }
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 0.5rem 1rem;
  }
`

export const OparatorFlex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;

  .ft {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;

    .MuiButton-root.MuiButton-outlined {
      margin-right: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .MuiButtonBase-root.MuiChip-root {
      margin: 0.25rem;
    }
  }

  .lt {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: center;

    .MuiButton-root.MuiButton-outlined {
      white-space: nowrap;
    }
  }

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 0;

    .ft,
    .lt {
      margin-bottom: 1rem;
    }
  }
`
