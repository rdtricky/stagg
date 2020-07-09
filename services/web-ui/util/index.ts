export const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
export const commaNum = (num:Number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
export const pluralizeStr = (str:string, count:number) => count === 1 ? str : `${str}s`