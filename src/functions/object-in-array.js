// const osArray = [
//   {id: 0, name: "Windows"},
//   {id: 1, name: "Linux"},
//   {id: 2, name: "MacOS"},
// ]

// const updatedOSArray = osArray.map(p =>
//   p.id === 1 ? { ...p, name: 'Ubuntu' } : p
// )

//   Output:

// After update:  [
//   {id: 0, name: "Windows"},
//   {id: 1, name: "Ubuntu"},
//   {id: 2, name: "MacOS"}
// ]

const updateOneKeyObjectInArray = (
  arrayData,
  findedKey,
  findedKeyValue,
  keyToUpdate,
  valueToUpdate
) => {
  return arrayData.map(p =>
    p[findedKey] === findedKeyValue ? { ...p, [keyToUpdate]: valueToUpdate } : p
  )
}

const updateAnObjectInArray = (
  arrayData,
  findedKey,
  findedKeyValue,
  objectDataToUpdate
) => {
  return arrayData.map(p =>
    p[findedKey] === findedKeyValue ? { ...p, ...objectDataToUpdate } : p
  )
}

const removeObjectInArray = (arrayData, findedKey, findedKeyValue) => {
  return arrayData.filter(p => p[findedKey] !== findedKeyValue)
}

export { updateOneKeyObjectInArray, updateAnObjectInArray, removeObjectInArray }
