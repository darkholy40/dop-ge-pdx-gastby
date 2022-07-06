const renderUserRole = roleName => {
  switch (roleName) {
    case `SuperAdministrator`:
      return `Super Administrator`

    case `Administrator`:
      return `ผู้ดูแลระบบ`

    case `Authenticated`:
      return `ผู้ใช้งาน`

    default:
      return ``
  }
}

export default renderUserRole
