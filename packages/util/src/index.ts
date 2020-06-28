// Async/await delay
export const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
export const commaNum = (num:Number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
export const timestamp = () => Math.round(new Date().getTime()/1000)
export namespace CallOfDuty {
    // Platform API tags and UI labels
    export const platformMap = {
        uno:    { label: 'ATV', name: 'Activision'          },
        xbl:    { label: 'XBL', name: 'Xbox Live'           },
        psn:    { label: 'PSN', name: 'PlayStation Network' },
        battle: { label: 'BTL', name: 'Battle.net'          },
    }
}
