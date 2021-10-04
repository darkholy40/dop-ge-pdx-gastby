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
`

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 960px;
  padding: 1rem 0;
  color: rgb(0, 0, 0);
  line-height: 28px;
  transition: 0.3s;

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: center;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
`

const Footer = () => (
  <FooterContainer>
    <FooterRow>
      <div>Copyright © {new Date().getFullYear() + 543} Apirak Suwanyoteee</div>
    </FooterRow>
  </FooterContainer>
)

export default Footer
