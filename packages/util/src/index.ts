// Async/await delay
export const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
export const commaNum = (num:Number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
export const percentage = (divisor:number, dividend:number, decimals:number=2) => ((divisor / dividend) * 100).toFixed(decimals)
export const timestamp = () => Math.round(new Date().getTime()/1000)
export namespace CallOfDuty {
    // Platform API tags and UI labels
    export const platformMap = {
        uno:    { label: 'ATV', name: 'Activision'          },
        xbl:    { label: 'XBL', name: 'Xbox Live'           },
        psn:    { label: 'PSN', name: 'PlayStation Network' },
        battle: { label: 'BTL', name: 'Battle.net'          },
    }
    export namespace Warzone {
        export const modeMap = {
            'br_87':              { type: 'br', teamSize: 1 },
            'br_71':              { type: 'br', teamSize: 1 },
            'br_brsolo':          { type: 'br', teamSize: 1 },
            'br_88':              { type: 'br', teamSize: 2 },
            'br_brduos':          { type: 'br', teamSize: 2 },
            'br_74':              { type: 'br', teamSize: 3 },
            'br_77':              { type: 'br', teamSize: 3 },
            'br_25':              { type: 'br', teamSize: 3 },
            'br_brtrios':         { type: 'br', teamSize: 3 },
            'br_jugg_brtriojugr': { type: 'br', teamSize: 3 }, // juggernaut drops in trios
            'br_89':              { type: 'br', teamSize: 4 },
            'br_brquads':         { type: 'br', teamSize: 4 },
            'br_86':              { type: 'br', teamSize: 4, realism: true },
            'br_br_real':         { type: 'br', teamSize: 4, realism: true }, // realism quads
            'br_brthquad':        { type: 'br', teamSize: 4, lobbySize: 200 }, // 200 player quads
            'brtdm_rmbl':         { type: 'tdm', teamSize: 6 },
            'br_dmz_38':          { type: 'plunder', teamSize: 3 },
            'br_dmz_76':          { type: 'plunder', teamSize: 4 },
            'br_dmz_85':          { type: 'plunder', teamSize: 4 },
            'br_dmz_104':         { type: 'plunder', teamSize: 4 },
        }
    }
}
