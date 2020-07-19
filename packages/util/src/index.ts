export const commaNum = (num:Number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
export const percentage = (divisor:number, dividend:number, decimals:number=2) => ((divisor / dividend) * 100).toFixed(decimals)
export const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
export const pluralizeStr = (str:string, count:number) => count === 1 ? str : `${str}s`
export const spaces = (num:number) => {
    let spaces = ''
    for(let i = 0; i < num; i++) {
        spaces += ' '
    }
    return spaces
}
