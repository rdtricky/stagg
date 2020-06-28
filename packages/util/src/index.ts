// Async/await delay
export const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))

export namespace CallOfDuty {
    // Platform API tags and UI labels
    export const platformMap = {
        uno:    { label: 'ATV', name: 'Activision'          },
        xbl:    { label: 'XBL', name: 'Xbox Live'           },
        psn:    { label: 'PSN', name: 'PlayStation Network' },
        battle: { label: 'BTL', name: 'Battle.net'          },
    }
}
