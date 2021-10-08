import React from "react"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheckCircle,
  faInfoCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons"
import styled from "styled-components"
import {
  green as successColor,
  amber as warningColor,
  red as errorColor,
} from "@mui/material/colors"

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;
`

const NotificationDialog = () => {
  const dispatch = useDispatch()
  const { notificationDialog } = useSelector(state => state)

  const open = notificationDialog.open || false
  const title = notificationDialog.title || ``
  const description = notificationDialog.description || ``
  const variant = notificationDialog.variant || ``

  const renderIcon = getVariant => {
    switch (getVariant) {
      case `success`:
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{
              fontSize: `4rem`,
              marginBottom: `1rem`,
              color: successColor[500],
            }}
          />
        )

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

      case `error`:
        return (
          <FontAwesomeIcon
            icon={faTimesCircle}
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
          color="primary"
          variant="contained"
          onClick={() => {
            notificationDialog.callback()
            dispatch({
              type: `SET_NOTIFICATION_DIALOG`,
              notificationDialog: {
                ...notificationDialog,
                open: false,
                callback: () => {},
              },
            })
          }}
        >
          ตกลง
        </Button>
      </DialogActions>
    </Dialog>
  )
}

NotificationDialog.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string,
}

NotificationDialog.defaultProps = {
  title: `การแจ้งเตือน`,
  description: ``,
  variant: ``,
}

export default NotificationDialog
