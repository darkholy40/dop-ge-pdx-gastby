const displaySessionTimer = sessionTimer => {
  if (parseInt(sessionTimer.hr) >= 24) {
    return `${Math.floor(parseInt(sessionTimer.hr) / 24)} วัน`
  }

  if (parseInt(sessionTimer.hr) > 0) {
    return `${parseInt(sessionTimer.hr)} ชม. ${parseInt(sessionTimer.min)} นาที`
  }

  if (parseInt(sessionTimer.min) > 0) {
    return `${parseInt(sessionTimer.min)} นาที ${parseInt(
      sessionTimer.sec
    )} วินาที`
  }

  return `${parseInt(sessionTimer.sec)} วินาที`
}

export default displaySessionTimer
