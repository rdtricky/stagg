import { Types } from '../store'

export interface Aggregate {
    divisor: number
    dividend: number
}
export interface AggregateGroup {
    players: { [key:string]: Aggregate }
    enemies: { [key:string]: Aggregate }
}
export const divisorStat = (matches:Types.MatchMap, performances:Types.ProfilePerformanceMap, dividendStat:string, divisorStat:string):AggregateGroup => {
    const enemies = {}
    const players = {}
    if (!matches || !performances) return { players, enemies }
    for(const key in performances) {
        for(const perf of Object.values(performances[key])) {
            if (!perf.stats) continue
            if (!players[key]) players[key] = { dividend: 0, divisor: 0 }
            players[key].divisor += Number(perf.stats[divisorStat]) || 0
            players[key].dividend += Number(perf.stats[dividendStat]) || 0
            if (!enemies[key]) enemies[key] = { dividend: 0, divisor: 0 }
        }
    }
    return { players, enemies }
}

export const divisorCount = (matches:Types.MatchMap, performances:Types.ProfilePerformanceMap, dividendStat:string):AggregateGroup => {
    const enemies = {}
    const players = {}
    return { players, enemies }
}
