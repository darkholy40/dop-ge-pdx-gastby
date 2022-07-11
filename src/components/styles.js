import styled from "styled-components"
import { blue } from "@mui/material/colors"

const Link = styled.a`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 800px;
`

const SearchButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  .MuiButton-root {
    width: 100px;
    height: 100px;
    border-radius: 100%;
  }
`

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

const DisabledBlock = styled.div`
  border-radius: 5px;
  transition: background-color 0.3s;

  &.disabled {
    opacity: 0.5;
    background-color: rgba(0, 0, 0, 0.25);
  }
`

const TextFieldWall = styled.div`
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckCircleFlex = styled.div`
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

const ColorButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  .row {
    width: 100%;
    max-width: ${({ width }) => (width !== undefined ? width : `300px`)};
    user-select: none;

    > div {
      height: ${({ height }) => (height !== undefined ? height : `50px`)};
      margin-bottom: 16px;
      padding: 8px 24px;
      border: 1px solid rgba(0, 0, 0, 0.24);
      border-radius: 8px;
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: flex-start;
      transition: background-color 0.2s, color 0.2s;

      @media (hover: hover) {
        &:hover {
          background-color: ${({ primaryColor }) =>
            primaryColor !== undefined ? primaryColor[700] : blue[700]};
          color: #fff;
          transition: background-color 0.1s, color 0.1s;
        }
      }

      &:active {
        background-color: ${({ primaryColor }) =>
          primaryColor !== undefined ? primaryColor[900] : blue[900]};
        color: #fff;
      }

      &.active {
        background-color: ${({ primaryColor }) =>
          primaryColor !== undefined ? primaryColor[700] : blue[700]};
        color: #fff;
      }
    }
  }
`

const TextFieldDummy = {
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

const TextFieldDummyOutlined = {
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

export {
  Link,
  Form,
  SearchButtonContainer,
  Flex,
  DisabledBlock,
  TextFieldWall,
  CheckCircleFlex,
  ColorButton,
  TextFieldDummy,
  TextFieldDummyOutlined,
}
