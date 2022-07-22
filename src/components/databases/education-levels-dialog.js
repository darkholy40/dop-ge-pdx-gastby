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

import { Form } from "../../components/styles"
import renderCheckingIcon from "../../functions/render-checking-icon"
import saveServerConfigsTag from "../../functions/save-server-configs-tag"

const EducationLevelsDialog = ({
  dataId,
  open,
  type,
  onCloseCallback,
  onFinishCallback,
}) => {
  const { token, userInfo } = useSelector(({ mainReducer }) => mainReducer)
  const { serverConfigs } = useSelector(({ staticReducer }) => staticReducer)
  const dispatch = useDispatch()
  const [name, setName] = useState(``)
  const [errorAlert, setErrorAlert] = useState({
    status: false,
    text: ``,
  })

  const getData = useCallback(async () => {
    try {
      const res = await client(token).query({
        query: gql`
          query EducationLevel {
            educationLevel(id: "${dataId}") {
              _id
              name
              createdAt
              updatedAt
            }
          }
        `,
      })

      const returnData = res.data.educationLevel

      if (returnData !== null) {
        setName(returnData.name)
      }
    } catch (error) {
      console.log(error.message)
    }
  }, [token, dataId])

  const closeModal = () => {
    onCloseCallback()

    setTimeout(() => {
      setName(``)
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
          mutation CreateEducationLevel {
            createEducationLevel(input: {
              data: {
                name: "${name}"
              }
            }) {
              educationLevel {
                _id
              }
            }
          }
        `,
      })

      const createdRowId = res.data.createEducationLevel.educationLevel._id

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
                description: "education-levels->create => ${createdRowId}",
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
        serverConfigs.find(elem => elem.name === `educationLevels`),
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
          mutation UpdateEducationLevel {
            updateEducationLevel(input: {
              where: {
                id: "${dataId}"
              }
              data: {
                name: "${name}"
              }
            }) {
              educationLevel {
                _id
              }
            }
          }
        `,
      })

      const updatedRowId = res.data.updateEducationLevel.educationLevel._id

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
                description: "education-levels->update => ${updatedRowId}",
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
        serverConfigs.find(elem => elem.name === `educationLevels`),
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
                  inputRef={node => {
                    if (node !== null) {
                      node.focus()
                    }
                  }}
                  sx={{ width: `100%` }}
                  label="* ชื่อระดับการศึกษา"
                  variant="outlined"
                  onChange={e => {
                    setName(e.target.value)
                    setErrorAlert(prev => ({
                      ...prev,
                      status: false,
                    }))
                  }}
                  value={name}
                  InputProps={{
                    endAdornment: renderCheckingIcon(
                      !errorAlert.status ? name : `warning`
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="success"
              variant="contained"
              type="submit"
              disabled={name === `` || errorAlert.status}
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

EducationLevelsDialog.propTypes = {
  dataId: PropTypes.string,
  open: PropTypes.bool,
  type: PropTypes.string,
  onCloseCallback: PropTypes.func,
  onFinishCallback: PropTypes.func,
}

EducationLevelsDialog.defaultProps = {
  dataId: ``,
  open: false,
  type: ``,
  onCloseCallback: () => {},
  onFinishCallback: () => {},
}

export default EducationLevelsDialog
