import React from "react"
import PropTypes from "prop-types"
import {
  Dialog,
  DialogTitle,
  Box,
  LinearProgress,
  Typography,
  Divider,
} from "@mui/material"
import styled from "styled-components"

const dialogContentPadding = `1rem 1.5rem`
const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: ${dialogContentPadding};
`

const PercentDialog = ({ data }) => {
  return (
    <Dialog fullWidth maxWidth="xs" open={data.length > 0}>
      {data.length > 0 &&
        data.map((item, index) => {
          return (
            <div
              id={`linear_progress_bar_${item.id}`}
              key={index}
              style={{
                transition: `opacity 0.3s`,
                opacity: item.percent < 100 ? 1 : 0,
              }}
            >
              <DialogTitle sx={{ padding: `${dialogContentPadding}` }}>
                {item.title}
              </DialogTitle>
              <Flex>
                <Box
                  sx={{
                    width: `100%`,
                    display: `flex`,
                    alignItems: `center`,
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
                      value={item.percent}
                      color={item.percent < 100 ? `primary` : `success`}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography
                      sx={{ transform: `skewX(-10deg)` }}
                      variant="body2"
                      color="text.secondary"
                    >{`${item.percent.toFixed(0)}%`}</Typography>
                  </Box>
                </Box>
              </Flex>
              {data.length > 1 && index < data.length - 1 && (
                <Divider style={{ margin: `0.5rem 1.5rem` }} />
              )}
            </div>
          )
        })}
    </Dialog>
  )
}

PercentDialog.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      open: PropTypes.bool,
      title: PropTypes.string,
      percent: PropTypes.number,
    })
  ),
}

PercentDialog.defaultProps = {
  data: [],
}

export default PercentDialog
