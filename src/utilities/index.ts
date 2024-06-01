export const isNumber = (value: any): boolean => {
    return !isNaN(value) && !isNaN(parseFloat(value))
}

export const isString = (value: any): boolean => {
    return typeof value === 'string'
}