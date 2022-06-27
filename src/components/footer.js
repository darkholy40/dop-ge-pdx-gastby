import React from "react"
import styled from "styled-components"

const FooterContainer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  position: relative;
  opacity: 1;
  background-color: #eee;
  padding: 1rem;

  @media (max-width: 599px) {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
`

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 960px;
  color: rgb(0, 0, 0);
  line-height: 28px;
  font-family: var(--main-font-family);
  transition: 0.3s;

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: center;
  }
`

const Footer = () => (
  <FooterContainer>
    <FooterRow>
      <div>GE-PDX โดย กสท.สพบ.กพ.ทบ.</div>
    </FooterRow>
  </FooterContainer>
)

export default Footer
