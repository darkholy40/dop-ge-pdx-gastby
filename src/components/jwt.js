import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"
import jwt_decode from "jwt-decode"

const Jwt = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state)

  React.useEffect(() => {
    if (token !== ``) {
      const decoded = jwt_decode(token)
      // const decodedHeader = jwt_decode(token, { header: true })

      const expired = Date.now() >= decoded.exp * 1000

      // console.log({
      //   decoded: decoded,
      //   decodedHeader: decodedHeader,
      //   expired: expired,
      // })

      if (expired) {
        navigate(`/`)

        dispatch({
          type: `SET_NOTIFICATION_DIALOG`,
          notificationDialog: {
            open: true,
            title: `เซสชันหมดอายุ`,
            description: `กรุณายืนยันตัวตนเพื่อเข้าใช้งานระบบอีกครั้ง`,
            variant: `error`,
            confirmText: `ตกลง`,
            callback: () => {},
          },
        })

        dispatch({
          type: `SET_TOKEN`,
          token: ``,
        })
      }
    }
  }, [token, dispatch])

  return <></>
}
export default Jwt
