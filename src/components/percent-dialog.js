import React from "react"
import PropTypes from "prop-types"
import {
  Dialog,
  DialogTitle,
  Box,
  LinearProgress,
  Typography,
} from "@mui/material"
import styled from "styled-components"

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;
`

const PercentDialog = ({ open, title, percent }) => {
  return (
    <Dialog fullWidth maxWidth="xs" open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Flex>
        <Box
          sx={{
            width: `100%`,
            display: `flex`,
            alignItems: `center`,
            transition: `opacity 0.3s`,
          }}
        >
          <Box sx={{ width: `100%`, mr: 1 }}>
            <LinearProgress
              sx={{
                height: `12px`,
                borderRadius: `8px`,
                ".MuiLinearProgress-bar": { borderRadius: `8px` },
              }}
              variant="determinate"
              value={percent}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography
              sx={{ transform: `skewX(-10deg)` }}
              variant="body2"
              color="text.secondary"
            >{`${percent.toFixed(0)}%`}</Typography>
          </Box>
        </Box>
      </Flex>
    </Dialog>
  )
}

PercentDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  percent: PropTypes.number,
}

PercentDialog.defaultProps = {
  open: false,
  title: ``,
  percent: 0,
}

export default PercentDialog
