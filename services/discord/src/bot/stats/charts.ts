import * as Discord from 'discord.js'
import { isolatedStat, ratioStat, findPlayer } from './data'
import * as staticRes from '../static'
import { msg } from '..'

const chartUrlPrefix = 'https://stagg.co/api/chart.png?c='

export const statOverTime = async (m:Discord.Message) => {
    const [,, stat, username ] = msg.args(m, false)
    const placeholder = await msg.placeholder(m, 'Finding player...')
    const player = await findPlayer(m, username)
    if (!player) {
        return msg.edit(placeholder, username !== 'me' 
            ? staticRes.playerNotFound : staticRes.playerNotRegistered)
    }
    msg.edit(placeholder, ['Loading profile...'])
    const statMethod = stat.includes('/') ? ratioStat : isolatedStat
    const data = await statMethod(player, stat)
    msg.edit(placeholder, ['Rendering chart...'])
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
    await msg.sendFiles(m, [
        `${chartUrlPrefix}{type:'line',data:{labels:[${chartLabels.join(',')}], datasets:[{label:'${stat.replace('/', ':')} over time', data: [${chartData.join(',')}], fill:false, borderColor:'%2301a2fc'},{label:'Avg ${stat.replace('/', ':')} over time', data: [${avgData.join(',')}], fill:false, borderColor:'%23aaa'}]}}`
    ])
    placeholder.delete()
}