import styled from "styled-components"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
`

const SubmitButtonFlex = styled.div`
  display: flex;
  justify-content: space-between;
`

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

const CheckCircleFlex = styled.div`
  border-radius: 0 5px 5px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.24);
  border-right: 1px solid rgba(0, 0, 0, 0.24);
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);
  height: 54px;
  width: 30px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export { Form, SubmitButtonFlex, Flex, CheckCircleFlex }
