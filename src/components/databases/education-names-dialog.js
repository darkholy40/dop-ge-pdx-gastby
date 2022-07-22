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

const EducationNamesDialog = ({
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
  const [errorAlert, setErrorAlert] = useState({
    status: false,
    text: ``,
  })

  const getData = useCallback(async () => {
    try {
      const res = await client(token).query({
        query: gql`
        query EducationName {
          educationName(id: "${dataId}") {
            _id
            short_name
            full_name
            createdAt
            updatedAt
          }
        }
      `,
      })

      const returnData = res.data.educationName

      if (returnData !== null) {
        setShortName(returnData.short_name)
        setFullName(returnData.full_name)
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
          mutation CreateEducationName {
            createEducationName(input: {
              data: {
                short_name: "${shortName}"
                full_name: "${fullName}"
              }
            }) {
              educationName {
                _id
              }
            }
          }
        `,
      })

      const createdRowId = res.data.createEducationName.educationName._id

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
                description: "education-names->create => ${createdRowId}",
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
        serverConfigs.find(elem => elem.name === `educationNames`),
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
          mutation UpdateEducationName {
            updateEducationName(input: {
              where: {
                id: "${dataId}"
              }
              data: {
                short_name: "${shortName}"
                full_name: "${fullName}"
              }
            }) {
              educationName {
                _id
              }
            }
          }
        `,
      })

      const updatedRowId = res.data.updateEducationName.educationName._id

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
                description: "education-names->update => ${updatedRowId}",
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
        serverConfigs.find(elem => elem.name === `educationNames`),
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
                  label="* ชื่อวุฒิการศึกษา"
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

EducationNamesDialog.propTypes = {
  dataId: PropTypes.string,
  open: PropTypes.bool,
  type: PropTypes.string,
  onCloseCallback: PropTypes.func,
  onFinishCallback: PropTypes.func,
}

EducationNamesDialog.defaultProps = {
  dataId: ``,
  open: false,
  type: ``,
  onCloseCallback: () => {},
  onFinishCallback: () => {},
}

export default EducationNamesDialog
