import * as API from '@stagg/api'
import * as Mongo from '@stagg/mongo'
import * as Discord from 'discord.js'
import logger from './logger'
import cfg from '../config'
import { SendConfirmation } from './mail'

let bot:Discord.Client

export const init = () => {
    Mongo.Config(cfg.mongo)
    bot = new Discord.Client()
    bot.login(cfg.discord.token)
    bot.on('ready', () => {
        console.log(`[+] Using bot ${bot.user.tag}`)
        bot.user.setActivity('for % messages...', {
            type: 'WATCHING',
            url: 'https://stagg.co/discord'
        })
    })
    bot.on('message', (m:Discord.Message) => dispatcher(m))
}

const dispatcher = async (m:Discord.Message) => {
    if (msg.isSelf(m)) return // message sent from the bot, ignore
    if (!msg.isDm(m) && !msg.triggerFound(m)) return // not a dm and no trigger, ignore
    logger.create(m)
    const [ cmd ] = msg.args(m)
    switch(cmd) {
        case 'wz': return wz.dispatcher(m)
        case 'help': return msg.send(m, static_help)
        case 'search': return search(m)
        case 'register': return register(m)
        case 'chart': return msg.sendFiles(m, ["https://stagg.co/api/chart.png?c={type:'pie',data:{labels:['Solos','Duos','Trios','Quads'],datasets:[{data:[6,4,52,42]}]}}"])
        default: return msg.send(m, static_invalid)
    }
}

const register = async (m:Discord.Message) => {
    const db = await Mongo.Client()
    const placeholder = await msg.placeholder(m, 'Working on it...')
    const [, query, platform='uno'] = msg.args(m)
    let player:Mongo.T.CallOfDuty.Schema.Player
    if (query.match(/[^@]+@[^\.]+\..+$/)) {
        msg.edit(placeholder, ['Looking up email...'])
        player = await db.collection('players').findOne({ email: query })
        if (!player) {
            return msg.edit(placeholder, ["Email not on file, are you sure you've logged in at https://stagg.co/login?"])
        }
    } else {
        player = await mdb.findPlayer({ username: query, platform })
        if (!player) {
            return msg.edit(placeholder, ['No players found, try `search` or `help`'])
        }
    }
    if (player.discord) {
        if (player.discord === m.author.id) {
            return msg.edit(placeholder, ['Your Discord account is already linked'])
        }
        return msg.edit(placeholder, ['There is already a Discord account linked to this account, check your settings at https://stagg.co'])
    }
    msg.edit(placeholder, ['Sending confirmation email...'])
    const send = await SendConfirmation(player.email, { discord: m.author.id })
    msg.edit(placeholder, [send ? 'Confirmation email sent, check your inbox' : 'Failed to send email, please try again or contact support'])
}

const search = async (m:Discord.Message) => {
    const [, username, platform ] = msg.args(m)
    if (!username || username.length < 3) return msg.send(m, ['Enter at least 3 characters you lazy turd'])
    const placeholder = await msg.placeholder(m, 'Searching for players...')
    const db = await Mongo.Client()
    const queries = []
    if (platform) {
        queries.push({ [`profiles.${platform.toLowerCase()}`]: { $regex: username, $options: 'i' } })
    } else {
        for( const p of Object.keys(API.Map.CallOfDuty.Platforms) ) {
            queries.push({ [`profiles.${p}`]: { $regex: username, $options: 'i' } })
        }
    }
    const players = await db.collection('players').find({ $or: queries }).toArray()
    if (!players) {
        return msg.edit(placeholder, ['Nothing found :('])
    }
    const output = ['Results:', '```']
    for(const player of players) {
        const playerOutput = []
        for(const platform in player.profiles) {
            if (player.profiles[platform].toLowerCase().includes(username.toLowerCase())) {
                playerOutput.push(`${player.profiles[platform]} (${platform})`)
            }
        }
        output.push('', ...playerOutput)
    }
    msg.edit(placeholder, [...output, '```'])
}

namespace mdb {
    interface PlayerIdentifiers {
        uno?:string
        discord?:string
        username?:string
        platform?:string
    }
    export const findPlayer = async (pids:PlayerIdentifiers) => {
        const db = await Mongo.Client()
        if (pids.uno) return db.collection('players').findOne({ uno: pids.uno })
        if (pids.discord) return db.collection('players').findOne({ discord: pids.discord })
        const { username='', platform='uno' } = pids
        return db.collection('players').findOne({ [`profiles.${platform.toLowerCase()}`]: { $regex: username, $options: 'i' } })
    }
}

namespace msg { // Discord.Message helpers
    export const args = (m:Discord.Message):string[] => msg.sanitizeInput(m).split(' ')
    export const isDm = (m:Discord.Message):boolean => m.channel.type === 'dm'
    export const isSelf = (m:Discord.Message):boolean => m.author.id === bot.user.id
    export const sanitizeInput = (m:Discord.Message):string => m.content.toLowerCase().replace(/^%\s*/, '').trim()
    export const triggerFound = (m:Discord.Message):boolean => !m.content.toLowerCase().trim().replace(`<@!${bot.user.id}>`, '%').indexOf('%')
    export const placeholder = (m:Discord.Message, text?:string):Promise<Discord.Message> => {
        return new Promise(
            (resolve,reject) => {
                m.channel.send(`> ${text || 'Working on it...'}`).then(async sentMessage => {
                    logger.link(m, sentMessage)
                    resolve(sentMessage)
                }).catch(e => reject(e))
            }
        )
    }
    export const formatOutput = (linesArr:string[]) => truncate(linesArr.reduce((prev, curr) => prev + `> ${curr}\n`, ''))
    export const send = (m:Discord.Message, output:string[]) => {
        const formattedOutput = formatOutput(output)
        m.channel.send(formattedOutput).then(async sentMessage => {
            logger.link(m, sentMessage)
        })
    }
    export const edit = (m:Discord.Message, output:string[]) => {
        const formattedOutput = formatOutput(output)
        m.edit(formattedOutput)
        logger.response(m, formattedOutput)
    }
    export const sendFiles = (m:Discord.Message, fileUrls:string[]) => {
        m.channel.send('', { files: fileUrls }).then(sentMessage => {
            logger.response(m, `files:${JSON.stringify(fileUrls)}`)
        })
    }
    export const truncate = (output:string):string => {
        let truncatedResponse = output
        if (truncatedResponse.length > 2000) {
            const closingCodeTag = '...```'
            const truncatedDisclaimer = `\n> _Message truncated; original message ${commaNum(output.length)} chars long_`
            const baseIndex = 2000 - truncatedDisclaimer.length
            truncatedResponse = truncatedResponse.slice(0, baseIndex)
            const hasUnclosedCodeTag = !(truncatedResponse.split('```').length % 2)
            if (hasUnclosedCodeTag) truncatedResponse = truncatedResponse.slice(0, baseIndex - closingCodeTag.length) + closingCodeTag
            truncatedResponse += truncatedDisclaimer
        }
        return truncatedResponse
    }
}

namespace wz {
    export const dispatcher = async (m:Discord.Message) => {
        const [, mode ] = msg.args(m)
        const depluralizedMode = mode.replace(/s$/i, '')
        return ['all', 'combined', 'solo', 'duo', 'trio', 'quad'].includes(depluralizedMode) 
            ? statsByMode(m, depluralizedMode) : msg.send(m, static_invalid)
    }

    const modeTeamSize = { all: -1, combined: 0, solo: 1, duo: 2, trio: 3, quad: 4 }
    const statsByMode = async (m:Discord.Message, modeIdentifier:string|number='all') => {
        const [,, username, platform ] = msg.args(m)
        const placeholder = await msg.placeholder(m, 'Finding player...')
        const player = username !== 'me'
            ? await mdb.findPlayer({ username, platform })
            : await mdb.findPlayer({ discord: m.author.id })
        if (!player) {
            return msg.edit(placeholder, username !== 'me' 
                ? static_playerNotFound : static_playerNotRegistered)
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
        const data = await fetch(player, modeIds, isFullReport)
        const teamSizeLables = ['Combined', 'Solos', 'Duos', 'Trios', 'Quads']
        const output = [
            ...playerHeaderReport(player, platform),
            '```'
        ]
        if (!isFullReport) {
            return msg.edit(placeholder, [...output, '', ...statsReport(data[0], teamSizeLables[teamSize]), '```'])
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
            output.push('', ...statsReport(groupedByTeamSizeLabel[label], label))
        }
        return msg.edit(placeholder, [...output, '```'])
    }
    const playerHeaderReport = (player:Mongo.T.CallOfDuty.Schema.Player, platform:string='uno'):string[] => [
        `**${player.profiles[platform]}** (${player.uno})`,
        `Full profile: https://stagg.co/wz/${player.profiles?.uno?.split('#').join('@')}`,
    ]
    const statsReport = (statsCluster:any, label:string):string[] => {
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
    const fetch = async (player:Mongo.T.CallOfDuty.Schema.Player, modeIds:string[]=[], groupByModeId=false) => {
        const db = await Mongo.Client()
        // if we're fetching "all" _id should be $modeId
        // if we're fetching anything else we should aggregate them all together
        const modeIdOp = !modeIds || !modeIds.length ? '$nin' : '$in'
        return db.collection('performances.wz').aggregate([
            { $match: { 'player._id': player._id, modeId: { [modeIdOp]: modeIds || [] } } },
            { $sort: { startTime: -1 } },
            { $group: {
                _id: groupByModeId ? '$modeId' : null,
                games: { $sum: 1 },
                score: { $sum: '$stats.score' },
                kills: { $sum: '$stats.kills' },
                deaths: { $sum: '$stats.deaths' },
                damageDone: { $sum: '$stats.damageDone' },
                damageTaken: { $sum: '$stats.damageTaken' },
                teamWipes: { $sum: '$stats.teamWipes' },
                eliminations: { $sum: '$stats.eliminations' },
                timePlayed: { $sum: '$stats.timePlayed' },
                distanceTraveled: { $sum: '$stats.distanceTraveled' },
                percentTimeMoving: { $sum: '$stats.percentTimeMoving' },
                // downs: { $sum: { $reduce: { input: '$stats.downs', initialValue: 0, in: { $add : ["$$value", "$$this"] } } } },
                gulagWins: {
                    $sum: {
                        $switch: { 
                            branches: [ 
                                { 
                                    case: { $gt: [ "$stats.gulagKills", 0 ] }, 
                                    then: 1
                                }
                            ], 
                            default: 0
                        }
                    }
                },
                gulagGames: {
                    $sum: {
                        $switch: { 
                            branches: [
                                { 
                                    case: { $gt: [ "$stats.gulagKills", 0 ] }, 
                                    then: 1
                                },
                                { 
                                    case: { $gt: [ "$stats.gulagDeaths", 0 ] }, 
                                    then: 1
                                }
                            ], 
                            default: 0
                        }
                    }
                },
                wins: {
                    $sum: {
                        $switch: { 
                            branches: [ 
                                { 
                                    case: { $eq: [ "$stats.teamPlacement", 1 ] }, 
                                    then: 1
                                }
                            ], 
                            default: 0
                        }
                    }
                },
                top5: {
                    $sum: {
                        $switch: { 
                            branches: [ 
                                { 
                                    case: { $lt: [ "$stats.teamPlacement", 6 ] }, 
                                    then: 1
                                }
                            ], 
                            default: 0
                        }
                    }
                },
                top10: {
                    $sum: {
                        $switch: { 
                            branches: [ 
                                { 
                                    case: { $lt: [ "$stats.teamPlacement", 11 ] }, 
                                    then: 1
                                }
                            ], 
                            default: 0
                        }
                    }
                }
            } },
        ]).toArray()
    }
}

// const aggr = await db.collection('performances.wz').aggregate([
//     { $match: { 'player._id': player._id } },
//     { $sort: { startTime: -1 } },
//     { $group: {
//         _id: { finishPos: '$stats.teamPlacement', mode: '$modeId' },
//         games: { $sum: 1 },
//         kills: { $sum: '$stats.kills' },
//         deaths: { $sum: '$stats.deaths' },
//     } },
//     { $limit: 50 },
// ], { cursor: { batchSize: 1 } }).toArray()

const static_invalid:string[] = [
    'Invalid command, try `help`'
]
const static_playerNotFound:string[] = [
    'Player not found, try `help`'
]
const static_playerNotRegistered:string[] = [
    'Your Discord has not been linked to a Stagg account yet, try `help`, then look for the `register` command'
]
const static_help:string[] = [
    '———————————————————————————',
    '**# First time users                                                                              #**',
    '———————————————————————————',
    'Getting started is an easy 3-step process:',
    '1) Create your account at https://profile.callofduty.com',
    '2) Sign in with your CallOfDuty account from Step #1 at https://stagg.co/login',
    '3) Relax while your match history is collected and try some of the commands below',
    '',
    '———————————————————————————',
    '**# Using the bot                                                                                  #**',
    '———————————————————————————',
    'If calling the bot in a text channel you will need to prefix messages with `%` or `@Stagg`; this is not necessary in DMs.',
    'DM example:',
    '```',
    'search HusKerrs',
    '```',
    'Text channel example:',
    '```',
    '% search HusKerrs',
    '```',
    '',
    'Available commands:',
    '- `help` Get help using the Stagg Discord bot',
    '- `search <username> <platform?>` Find profiles matching your query',
    '- `register <email> OR <username> <platform>` Link your Discord',
    '- `wz all <username> <platform?>` Show all aggregated BR stats',
    '- `wz solos <username> <platform?>` Aggregated stats from all BR Solos matches',
    '- `wz duos <username> <platform?>` Aggregated stats from all BR Duos matches',
    '- `wz trios <username> <platform?>` Aggregated stats from all BR Trios matches',
    '- `wz quads <username> <platform?>` Aggregated stats from all BR Quads matches',
    '- `wz combined <username> <platform?>` Aggregated stats from all BR modes',
    '',
    'Any arguments that end with `?` are optional (eg: `<platform?>`); default values are listed below:',
    '- `<platform?> = uno` (Activision)',
    '',
    'Additional support may be provided on an as-needed basis in the `#help` channel here: https://discord.gg/VC6P63e',
    '',
    'If you want this humble binary buck in your server, click the link below:',
    'https://discord.com/oauth2/authorize?client_id=723179755548967027&scope=bot&permissions=67584',
]
const commaNum = (num:Number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
const percentage = (divisor:number, dividend:number, decimals:number=2) => ((divisor / dividend) * 100).toFixed(decimals)
