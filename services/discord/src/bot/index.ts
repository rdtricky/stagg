import * as API from '@stagg/api'
import * as Mongo from '@stagg/mongo'
import * as Discord from 'discord.js'
import { SendConfirmation } from '../mail'
import { byMode } from './stats/reports'
import { statOverTime } from './stats/charts'
import { ratioStat } from './stats/data'
import * as staticRes from './static'
import { commaNum } from '../util'
import logger from './logger'
import cfg from '../config'

let bot:Discord.Client

export const init = async () => {
    Mongo.config(cfg.mongo)
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
        case 'help': return msg.send(m, staticRes.help)
        case 'stats': return msg.send(m, staticRes.statsList)
        case 'defaults': return msg.send(m, staticRes.defaultArgs)
        case 'teams': return teams(m)
        case 'search': return search(m)
        case 'register': return register(m)
        case 'shortcut': return shortcut(m)
        case 'chart': return msg.sendFiles(m, ["https://stagg.co/api/chart.png?c={type:'pie',data:{labels:['Solos','Duos','Trios','Quads'],datasets:[{data:[6,4,52,42]}]}}"])
        default: return msg.send(m, staticRes.invalid)
    }
}

namespace wz {
    export const dispatcher = async (m:Discord.Message) => {
        const [, operator ] = msg.args(m)
        operator === 'chart' ? chart(m) : report(m)
    }
    const report = async (m:Discord.Message) => {
        const [, mode ] = msg.args(m)
        const depluralizedMode = mode.replace(/s$/i, '')
        return ['all', 'combined', 'solo', 'duo', 'trio', 'quad'].includes(depluralizedMode) 
            ? byMode(m, depluralizedMode) : msg.send(m, staticRes.invalid)
    }
    const chart = async (m:Discord.Message) => {
        statOverTime(m)
    }
}

const shortcut = async (m:Discord.Message) => {
    const db = await Mongo.client()
    const placeholder = await msg.placeholder(m, 'Working on it...')
    const [, shortcut, ...payload] = msg.args(m)
    if (shortcut === 'delete') {
        await db.collection('players').updateOne({ discord: m.author.id }, { $unset: { [`discordShortcuts.${payload.join('')}`]: '' } })
        return msg.edit(placeholder, ['Shortcut deleted'])
    }
    await db.collection('players').updateOne({ discord: m.author.id }, { $set: { [`discordShortcuts.${shortcut}`]: payload.join(' ') } })
    msg.edit(placeholder, ['Shortcut created'])
}

const teams = async (m:Discord.Message) => {
    const placeholder = await msg.placeholder(m, 'Pulling player records...')
    const [, ...tags] = msg.args(m)
    if (!tags.includes(`<@!${m.author.id}>`)) {
        tags.push(`<@!${m.author.id}>`)
    }
    const stats:[string, number][] = [] // [key,val]
    for(const tag of tags) {
        const player = await msg.hydrateUsername(m, tag)
        if (!player) continue
        const stat = 'damageDone/timePlayed'
        const dmgPerSecArr = await ratioStat(player, stat)
        let total = 0
        for(const dmg of dmgPerSecArr) total += dmg[stat]
        stats.push([player.profiles?.uno || tag, total / dmgPerSecArr.length])
    }
    const sorted = stats.sort((a,b) => a[1]-b[1])
    const minTeams = Math.ceil(sorted.length / 4)
    const diffPercs = sorted.map((kvArr, i) => !sorted[i+1] ? null : kvArr[1] / sorted[i+1][1])
    const sortedDiff = [...diffPercs].sort()
    const biggestDiffIndexes = sortedDiff.map(v => diffPercs.indexOf(v))
    const teams = []
    for(let i = 0; i < minTeams; i++) {
        const prev = biggestDiffIndexes[i-1] || 0
        const next = biggestDiffIndexes[i] || sorted.length
        teams.push(sorted.slice(prev, next))
    }
    const output = []
    let i = 1
    for(const team of teams) {
        output.push(`\`\`\`Team #${i++}`)
        for(const [k,v] of team) {
            output.push(k)
        }
        output.push('```')
    }
    msg.edit(placeholder, output)
}

const register = async (m:Discord.Message) => {
    const db = await Mongo.client()
    const placeholder = await msg.placeholder(m, 'Working on it...')
    const [, query, platform='uno'] = msg.args(m)
    let player:Mongo.Schema.CallOfDuty.Player
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
    const db = await Mongo.client()
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

export namespace mdb {
    export let db:Mongo.Db
    interface PlayerIdentifiers {
        uno?:string
        discord?:string
        username?:string
        platform?:string
    }
    export const findPlayer = async (pids:PlayerIdentifiers) => {
        const db = await Mongo.client()
        if (pids.uno) return db.collection('players').findOne({ uno: pids.uno })
        if (pids.discord) return db.collection('players').findOne({ discord: pids.discord })
        const { username='', platform='uno' } = pids
        return db.collection('players').findOne({ [`profiles.${platform.toLowerCase()}`]: { $regex: username, $options: 'i' } })
    }
}

export namespace msg { // Discord.Message helpers
    export const args = (m:Discord.Message, toLower:boolean=true):string[] => msg.sanitizeInput(m, toLower).split(' ')
    export const isDm = (m:Discord.Message):boolean => m.channel.type === 'dm'
    export const isSelf = (m:Discord.Message):boolean => m.author.id === bot.user.id
    export const sanitizeInput = (m:Discord.Message, toLower:boolean=true):string => 
        (!toLower ? m.content : m.content.toLowerCase()).replace(/^%\s*/, '').replace(/\s+/g, ' ').trim()
    export const triggerFound = (m:Discord.Message):boolean => !m.content.toLowerCase().trim().replace(`<@!${bot.user.id}>`, '%').indexOf('%')
    export const hydratedArgs = async (m:Discord.Message) => {
        const arr = args(m)
        const db = await Mongo.client()
        for(const index in arr) {
            const word = arr[index]
            const player = await db.collection('players').findOne({ discord: m.author.id })
            if (!player || !player.discordShortcuts || !player.discordShortcuts[word]) continue
            arr[index] = player.discordShortcuts[word]
        }
        return arr
    }
    export const hydrateUsername = async (m:Discord.Message, username:string, platform:string='uno'):Promise<Mongo.Schema.CallOfDuty.Player> => {
        const db = await Mongo.client()
        if (username === 'me') {
            return await db.collection('players').findOne({ discord: m.author.id })
        }
        if (username.match(/<@![0-9]+>/)) {
            const discordId = username.replace(/<@!([0-9]+)>/, '$1')
            return await db.collection('players').findOne({ discord: discordId })
        }
        const player = await db.collection('players').findOne({ discord: m.author.id })
        if (player.discordShortcuts[username]) {
            const [ uname, platform ] = player.discordShortcuts[username].split(' ')
            return await mdb.findPlayer({ username: uname, platform })
        }
        return await mdb.findPlayer({ username, platform })
    }
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
        return new Promise(
            (resolve,reject) => {
                const formattedOutput = formatOutput(output)
                m.channel.send(formattedOutput).then(async sentMessage => {
                    logger.link(m, sentMessage)
                    resolve(sentMessage)
                }).catch(e => reject(e))
            }
        )
    }
    export const edit = (m:Discord.Message, output:string[]) => {
        const formattedOutput = formatOutput(output)
        m.edit(formattedOutput)
        logger.response(m, formattedOutput)
    }
    export const sendFiles = (m:Discord.Message, fileUrls:string[]) => new Promise((resolve,reject) => {
        m.channel.send('', { files: fileUrls }).then(sentMessage => {
            logger.response(m, `files:${JSON.stringify(fileUrls)}`)
            resolve(sentMessage)
        })
    })
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
