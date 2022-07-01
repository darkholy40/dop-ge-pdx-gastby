const renderFullname = obj => {
  const { rank, name, surname } = obj
  let fullname = ``

  if (rank !== undefined && rank !== null && rank !== ``) {
    fullname += `${rank} `
  }

  if (name !== undefined && name !== null && name !== ``) {
    fullname += `${name} `
  }

  if (surname !== undefined && surname !== null && surname !== ``) {
    fullname += `${surname}`
  }

  return fullname
}

export default renderFullname
