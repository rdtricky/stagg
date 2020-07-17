import * as Discord from 'discord.js'
import * as Mongo from '@stagg/mongo'
import * as API from '@stagg/api'
import { commaNum, percentage } from '../../util'
import * as staticRes from '../static'
import { statsReportByMode } from './data'
import { msg } from '..'

const modeTeamSize = { all: -1, combined: 0, solo: 1, duo: 2, trio: 3, quad: 4 }
export const byMode = async (m:Discord.Message, modeIdentifier:string|number='all') => {
    const [,, username, platform ] = await msg.hydratedArgs(m)
    const placeholder = await msg.placeholder(m, 'Finding player...')
    const player = await msg.hydrateUsername(m, username, platform)
    if (!player) {
        return msg.edit(placeholder, username !== 'me' 
            ? staticRes.playerNotFound : staticRes.playerNotRegistered)
    }
    msg.edit(placeholder, ['Loading profile...'])
    const type = 'br' // may do plunder in future but meh
    const teamSize = typeof modeIdentifier === typeof 1 ? modeIdentifier : modeTeamSize[modeIdentifier]
    const modeIds = []
    if (teamSize >= 1) {
        // get all modeIds for this teamSize
        for(const modeId in API.Map.CallOfDuty.Modes) {
            const modeDetails = API.Map.CallOfDuty.Modes[modeId]
            if (modeDetails.type === type && modeDetails.teamSize === teamSize) {
                modeIds.push(modeId)
            }
        }
    }
    const isFullReport = teamSize === -1 // "all" breaks all stats down by modes
    const data = await statsReportByMode(player, modeIds, isFullReport)
    const teamSizeLables = ['Combined', 'Solos', 'Duos', 'Trios', 'Quads']
    const output = [
        ...header(player, platform),
        '```'
    ]
    if (!isFullReport) {
        return msg.edit(placeholder, [...output, '', ...formatOutput(data[0], teamSizeLables[teamSize]), '```'])
    }
    // Combine groups from different modeIds of the same teamSize
    const groupedByTeamSizeLabel = {}
    for(const modeData of data) {
        const modeDetails = API.Map.CallOfDuty.Modes[modeData._id]
        if (!modeDetails || modeDetails.type !== type) {
            continue
        }
        const dataGroup = groupedByTeamSizeLabel[teamSizeLables[modeDetails.teamSize]]
        if (!dataGroup) {
            groupedByTeamSizeLabel[teamSizeLables[modeDetails.teamSize]] = { ...modeData }
            continue
        }
        // merge the existing and new stats together
        for(const key in dataGroup) {
            groupedByTeamSizeLabel[teamSizeLables[modeDetails.teamSize]][key] = dataGroup[key] + modeData[key]
        }
    }
    for(const label of Object.keys(groupedByTeamSizeLabel).sort((a,b) => teamSizeLables.indexOf(a) - teamSizeLables.indexOf(b))) {
        output.push('', ...formatOutput(groupedByTeamSizeLabel[label], label))
    }
    return msg.edit(placeholder, [...output, '```'])
}

const header = (player:Mongo.Schema.CallOfDuty.Player, platform:string='uno'):string[] => [
    `**${player.profiles[platform]}** (${player.uno})`,
    `Full profile: https://stagg.co/wz/${player.profiles?.uno?.split('#').join('@')}`,
]
const formatOutput = (statsCluster:any, label:string):string[] => {
    return [
        `WZ BR ${label}:`,
        '--------------------------------',
        `Wins: ${commaNum(statsCluster.wins)}`,
        `Games: ${commaNum(statsCluster.games)}`,
        `Kills: ${commaNum(statsCluster.kills)}`,
        // `Downs: ${commaNum(statsCluster.downs)}`,
        `Deaths: ${commaNum(statsCluster.deaths)}`,
        // `Loadouts: ${commaNum(statsCluster.loadouts)}`,
        `Win rate: ${percentage(statsCluster.wins, statsCluster.games)}%`,
        `Top 5 rate: ${percentage(statsCluster.top5, statsCluster.games)}%`,
        `Top 10 rate: ${percentage(statsCluster.top10, statsCluster.games)}%`,
        `Gulag win rate: ${percentage(statsCluster.gulagWins, statsCluster.gulagGames)}%`,
        `Kills per death: ${(statsCluster.kills/statsCluster.deaths).toFixed(2)}`,
        `Damage per kill: ${commaNum(Math.round(statsCluster.damageDone / statsCluster.kills))}`,
        `Damage per death: ${commaNum(Math.round(statsCluster.damageTaken / statsCluster.deaths))}`,
    ]
}