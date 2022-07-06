const renderFullname = obj => {
  let fullname = ``

  if (obj !== null) {
    const { rank, name, surname } = obj

    if (rank !== undefined && rank !== null && rank !== ``) {
      fullname += `${rank} `
    }

    if (name !== undefined && name !== null && name !== ``) {
      fullname += `${name} `
    }

    if (surname !== undefined && surname !== null && surname !== ``) {
      fullname += `${surname}`
    }
  }

  return fullname
}

export default renderFullname
