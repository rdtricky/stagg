import * as Discord from 'discord.js'
import * as Mongo from '@stagg/mongo'
import { hydratePlayerIdentifiers, isolatedStat, ratioStat } from '../data'
import relay from '../../relay'

const chartUrlPrefix = 'https://stagg.co/api/chart.png?c='

export default async (m:Discord.Message, stat:string, ...pids:string[]) => {
    const rly = await relay(m, ['Finding players(s)...'])
    const foundPlayers = await hydratePlayerIdentifiers(m.author.id, pids)
    if (!foundPlayers) {
        rly.edit(['Player(s) not found...'])
        return
    }
    rly.edit(['Loading profile(s)...'])
    const chartUrls = await statOverTime(foundPlayers.map(fp => fp.player), stat)
    rly.edit(['Rendering chart...'])
    await rly.files(chartUrls)
    rly.delete()
}

const statOverTime = async (players:Mongo.Schema.CallOfDuty.Player[], stat:string):Promise<string[]> => {
    const [player] = players
    const statMethod = stat.includes('/') ? ratioStat : isolatedStat
    const data = await statMethod(player, stat)
    const chartData = []
    const chartLabels = []
    let i = 1
    for(const doc of data) {
        chartLabels.push(i++)
        chartData.push(doc[stat])
    }
    const avgData = []
    const avg = chartData.reduce((a,b) => a+b, 0) / chartData.length
    for(let i = 0; i < chartData.length; i++) {
        avgData.push(avg)
    }
    return [
        `${chartUrlPrefix}{type:'line',data:{labels:[${chartLabels.join(',')}], datasets:[{label:'${stat.replace('/', ':')} over time', data: [${chartData.join(',')}], fill:false, borderColor:'%2301a2fc'},{label:'Avg ${stat.replace('/', ':')} over time', data: [${avgData.join(',')}], fill:false, borderColor:'%23aaa'}]}}`
    ]
}