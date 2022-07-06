const roleLevel = getUserRole => {
  if (getUserRole !== null) {
    switch (getUserRole.name) {
      case `Authenticated`:
        return 1

      case `Administrator`:
        return 2

      case `SuperAdministrator`:
        return 3

      default:
        return 0
    }
  }

  return 0
}

export default roleLevel
