export const onlyDefinedValues = (object: Record<string, unknown>) => {
  Object.keys(object).forEach(
    (key) => object[key] === undefined && delete object[key],
  )
  return object
}
