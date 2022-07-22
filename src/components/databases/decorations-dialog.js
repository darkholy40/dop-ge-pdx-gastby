import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Tooltip,
  Button,
  TextField,
  Collapse,
  Alert,
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"

import { client, gql } from "../../functions/apollo-client"

import { Form } from "../styles"
import renderCheckingIcon from "../../functions/render-checking-icon"
import saveServerConfigsTag from "../../functions/save-server-configs-tag"

const DecorationsDialog = ({
  dataId,
  open,
  type,
  onCloseCallback,
  onFinishCallback,
}) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { serverConfigs } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [shortName, setShortName] = useState(``)
  const [fullName, setFullName] = useState(``)
  const [engName, setEngName] = useState(``)
  const [errorAlert, setErrorAlert] = useState({
    status: false,
    text: ``,
  })

  const getData = useCallback(async () => {
    try {
      const res = await client(token).query({
        query: gql`
          query Decoration {
            decoration(id: "${dataId}") {
              _id
              short_name
              full_name
              eng_name
              createdAt
              updatedAt
            }
          }
      `,
      })

      const returnData = res.data.decoration

      if (returnData !== null) {
        setShortName(returnData.short_name)
        setFullName(returnData.full_name)
        setEngName(returnData.eng_name)
      }
    } catch (error) {
      console.log(error.message)
    }
  }, [token, dataId])

  const closeModal = () => {
    onCloseCallback()

    setTimeout(() => {
      setShortName(``)
      setFullName(``)
      setEngName(``)
      setErrorAlert({
        status: false,
        text: ``,
      })
    }, 200)
  }

  const goAdd = async () => {
    try {
      const res = await client(token).mutate({
        mutation: gql`
          mutation CreateDecoration {
            createDecoration(input: {
              data: {
                short_name: "${shortName}"
                full_name: "${fullName}"
              }
            }) {
              decoration {
                _id
              }
            }
          }
        `,
      })

      const createdRowId = res.data.createDecoration.decoration._id

      closeModal()
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การเพิ่มข้อมูล`,
          description: `เพิ่มข้อมูลสำเร็จ`,
          variant: `success`,
          confirmText: `ตกลง`,
          callback: () => onFinishCallback(),
        },
      })

      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "action",
                description: "decorations->create => ${createdRowId}",
                users_permissions_user: "${userInfo._id}",
              }
            }) {
              log {
                _id
              }
            }
          }
        `,
      })

      saveServerConfigsTag(
        serverConfigs.find(elem => elem.name === `decorations`),
        token
      )
    } catch (error) {
      switch (error.message) {
        case `Duplicate entry`:
          setErrorAlert({
            status: true,
            text: `มีข้อมูลรายการนี้อยู่แล้ว`,
          })
          break

        default:
          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `การเพิ่มข้อมูลไม่สำเร็จ`,
              description: `ไม่สามารถเพิ่มข้อมูลได้`,
              variant: `error`,
              confirmText: `ตกลง`,
              callback: () => {},
            },
          })
          break
      }
    }
  }

  const goEdit = async () => {
    try {
      const res = await client(token).mutate({
        mutation: gql`
          mutation UpdateDecoration {
            updateDecoration(input: {
              where: {
                id: "${dataId}"
              }
              data: {
                short_name: "${shortName}"
                full_name: "${fullName}"
              }
            }) {
              decoration {
                _id
              }
            }
          }
        `,
      })

      const updatedRowId = res.data.updateDecoration.decoration._id

      closeModal()
      dispatch({
        type: `SET_NOTIFICATION_DIALOG`,
        notificationDialog: {
          open: true,
          title: `การบันทึกข้อมูล`,
          description: `บันทึกข้อมูลสำเร็จ`,
          variant: `success`,
          confirmText: `ตกลง`,
          callback: () => onFinishCallback(),
        },
      })

      client(token).mutate({
        mutation: gql`
          mutation CreateLog {
            createLog(input: {
              data: {
                action: "action",
                description: "decorations->update => ${updatedRowId}",
                users_permissions_user: "${userInfo._id}",
              }
            }) {
              log {
                _id
              }
            }
          }
        `,
      })

      saveServerConfigsTag(
        serverConfigs.find(elem => elem.name === `decorations`),
        token
      )
    } catch (error) {
      switch (error.message) {
        case `Duplicate entry`:
          setErrorAlert({
            status: true,
            text: `มีข้อมูลรายการนี้อยู่แล้ว`,
          })
          break

        default:
          dispatch({
            type: `SET_NOTIFICATION_DIALOG`,
            notificationDialog: {
              open: true,
              title: `การบันทึกข้อมูลไม่สำเร็จ`,
              description: `ไม่สามารถบันทึกข้อมูลได้`,
              variant: `error`,
              confirmText: `ตกลง`,
              callback: () => {},
            },
          })
          break
      }
    }
  }

  useEffect(() => {
    if (open && dataId !== ``) {
      getData()
    }
  }, [open, dataId, getData])

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        scroll="paper"
        open={open}
        onClose={() => closeModal()}
      >
        <Form
          style={{ width: `100%`, maxWidth: `100%` }}
          onSubmit={e => {
            e.preventDefault()

            type === `add` ? goAdd() : goEdit()
          }}
        >
          <DialogTitle>
            {type === `add` ? `เพิ่มข้อมูล` : `แก้ไขข้อมูล`}
          </DialogTitle>
          <DialogContent dividers sx={{ padding: `2rem 1.5rem` }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  sx={{ width: `100%` }}
                  label="* ชื่อเครื่องราชอิสริยาภรณ์"
                  variant="outlined"
                  onChange={e => {
                    setFullName(e.target.value)
                    setErrorAlert(prev => ({
                      ...prev,
                      status: false,
                    }))
                  }}
                  value={fullName}
                  InputProps={{
                    endAdornment: renderCheckingIcon(
                      !errorAlert.status ? fullName : `warning`
                    ),
                  }}
                  error={errorAlert.status}
                />
                <Collapse in={errorAlert.status}>
                  <Alert sx={{ marginTop: `1rem` }} severity="error">
                    {errorAlert.text}
                  </Alert>
                </Collapse>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={{ width: `100%` }}
                  label="ชื่อย่อ"
                  variant="outlined"
                  onChange={e => {
                    setShortName(e.target.value)
                    setErrorAlert(prev => ({
                      ...prev,
                      status: false,
                    }))
                  }}
                  value={shortName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={{ width: `100%` }}
                  label="ชื่อภาษาอังกฤษ"
                  variant="outlined"
                  onChange={e => {
                    setEngName(e.target.value)
                    setErrorAlert(prev => ({
                      ...prev,
                      status: false,
                    }))
                  }}
                  value={engName}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="success"
              variant="contained"
              type="submit"
              disabled={fullName === `` || errorAlert.status}
            >
              {type === `add` ? `เพิ่ม` : `บันทึก`}
            </Button>
          </DialogActions>
          <DialogActions sx={{ position: `absolute`, top: 0, right: 0 }}>
            <Tooltip arrow placement="bottom" title="ปิดหน้าต่าง">
              <IconButton
                style={{ width: 40, height: 40 }}
                onClick={() => closeModal()}
              >
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  )
}

DecorationsDialog.propTypes = {
  dataId: PropTypes.string,
  open: PropTypes.bool,
  type: PropTypes.string,
  onCloseCallback: PropTypes.func,
  onFinishCallback: PropTypes.func,
}

DecorationsDialog.defaultProps = {
  dataId: ``,
  open: false,
  type: ``,
  onCloseCallback: () => {},
  onFinishCallback: () => {},
}

export default DecorationsDialog
