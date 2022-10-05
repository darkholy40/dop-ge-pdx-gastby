import React from "react"
import PropTypes from "prop-types"
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle, faTrash } from "@fortawesome/free-solid-svg-icons"
import styled from "styled-components"
import { amber as warningColor, red as errorColor } from "@mui/material/colors"

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;
`

const ConfirmationDialog = ({
  open,
  title,
  description,
  variant,
  confirmCallback,
  cancelCallback,
  confirmText,
  cancelText,
}) => {
  const renderIcon = getVariant => {
    switch (getVariant) {
      case `warning`:
        return (
          <FontAwesomeIcon
            icon={faInfoCircle}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: warningColor[500],
            }}
          />
        )

      case `delete`:
        return (
          <FontAwesomeIcon
            icon={faTrash}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: errorColor[500],
            }}
          />
        )

      default:
        return (
          <FontAwesomeIcon
            icon={faInfoCircle}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: warningColor[500],
            }}
          />
        )
    }
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Flex>
        {renderIcon(variant)}
        <span>{description}</span>
      </Flex>
      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            cancelCallback()
          }}
        >
          {cancelText}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            cancelCallback()
            confirmCallback()
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string,
  confirmCallback: PropTypes.func,
  cancelCallback: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
}

ConfirmationDialog.defaultProps = {
  open: false,
  title: `การยืนยัน?`,
  description: `กรุณากดปุ่ม "ตกลง" เพื่อยืนยัน`,
  variant: ``,
  confirmCallback: () => {},
  cancelCallback: () => {},
  confirmText: `ตกลง`,
  cancelText: `ยกเลิก`,
}

export default ConfirmationDialog
