import * as Mongo from '@stagg/mongo'
import { Client, Message } from 'discord.js'
import { CallOfDuty as CallOfDutyAPI } from '@stagg/api'

const commaNum = (num:Number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
export default class {
    private bot:Client
    constructor(loginToken:string, mongoConfig:Mongo.T.Config) {
        Mongo.Config(mongoConfig)
        this.bot = new Client()
        this.bot.login(loginToken)
        this.bot.on('ready', () => console.log(`[+] Discord Bot logged in as ${this.bot.user.tag}`))
        this.bot.on('message', async (msg:Message) => this.MessageController(msg))
    }
    async MessageController(msg:Message):Promise<void> {
        const content = msg.content.trim().replace(`<@!${this.bot.user.id}>`, ':BOT_TAG:')
        // Allow DMs without manual triggers
        const isDM = msg.channel.type as any === 'dm'
        const hasTagTrigger = content.match(/^:BOT_TAG:/)
        const hasTextTrigger = content.match(/^%/i)
        if (!isDM && !hasTagTrigger && !hasTextTrigger) return
        if (`${msg.author.username}#${msg.author.discriminator}` === this.bot.user.tag) return // ignore messages from self
        const [cmd, ...args] = content.replace(/^%/, '').replace(/^:BOT_TAG:/, '').trim().replace(/\s+/g, ' ').split(' ')
        let response:string = ''
        switch(cmd.toLowerCase()) {
            case 'help':
                response = this.Help()
                break
            case 'connect':
                response = '> Click below to authorize the Stagg bot for your Discord server\n> https://discord.com/oauth2/authorize?client_id=723179755548967027&scope=bot&permissions=67584'
                break
            case 'meta':
                response = await this.MetaStats()
                break
            case 'search':
                const profilesArr = await this.SearchProfile(args[0]) as any[]
                response = ''
                for(const userProfiles of profilesArr) {
                    for(const platform of Object.keys(userProfiles)) {
                        const username = userProfiles[platform]
                        if (username.toLowerCase().includes(args[0].toLowerCase())) {
                            response += `\n> ${username} (${platform})`
                        }
                    }
                }
                response = !response ? '> No results :(' : '> Results:' + response
                break
            case 'kpg':
                const kpg = await this.KPG(args[0], args[1] as Mongo.T.CallOfDuty.Platform)
                response = `> Total kills: ${commaNum(kpg.kills)}\n`+
                    `> Total games: ${commaNum(kpg.matches)}\n`+
                    `> Average kills: ${(kpg.kills / kpg.matches).toFixed(2)}`
                break
            case 'dpk':
                const dpk = await this.DPK(args[0], args[1] as Mongo.T.CallOfDuty.Platform)
                response = `> Damage per kill: ${commaNum(Math.round(dpk.damageDone / dpk.kills))}\n`+
                    `> Damage per death: ${commaNum(Math.round(dpk.damageTaken / dpk.deaths))}\n`+
                    `> Total kills: ${commaNum(dpk.kills)}\n`+
                    `> Total deaths: ${commaNum(dpk.deaths)}\n`+
                    `> Total damage done: ${commaNum(dpk.damageDone)}\n`+
                    `> Total damage taken: ${commaNum(dpk.damageTaken)}`
                break
            case 'kdr':
                const kdr = await this.KDR(args[0], args[1] as Mongo.T.CallOfDuty.Platform)
                response = `> Total kills: ${commaNum(kdr.kills)}\n`+
                    `> Total deaths: ${commaNum(kdr.deaths)}\n`+
                    `> Total games: ${commaNum(kdr.matches)}\n`+
                    `> Average KDR: ${(kdr.kills / kdr.deaths).toFixed(2)}`
                break
            case 'ping':
                response = await this.PingProfile(args[0], args[1] as Mongo.T.CallOfDuty.Platform)
                break
            default:
                response = '> Unrecognized command, try `help`'
        }
        msg.channel.send(response)
    }

    Help():string {
        return (
            '> Start messages with `%`, `@Stagg`, or DM `Stagg#4282` to trigger the bot\n'+
            '> Use CLI-style space-separated commands and arguments.\n'+
            '> eg: ping the `Activision` profile for `MellowD#6992980`\n'+
            '> ```% ping MellowD#6992980 ATV```\n'+
            '> Available commands: \n'+
            '> - `help` Get help using the Stagg Discord bot\n'+
            '> - `meta` Get stats on the overall Stagg service\n'+
            '> - `connect` Add the Stagg bot to your own Discord\n'+
            '> - `search <username>` Find profiles matching your query\n'+
            '> - `ping <username> <platform?>` Get status of player\n'+
            '> - `kdr <username> <platform?>` Get Kill/Death Ratio for player\n'+
            '> - `kpg <username> <platform?>` Get average kills per game for player\n'+
            '> - `dpk <username> <platform?>` Get average damage per kill/death for player\n'+
            '> \n'+
            '> Any arguments that end with `?` are optional (eg: `<platform?>`); default values are listed below:\n'+
            '> - `<platform?>` ATV (Activision)\n'+
            '> \n'+
            '> Please note that aggregate commands (`kdr`, `kpg`) process your _entire match history_ so please be patient, it is most likely fetching hundreds or thousands of matches.\n'+
            ''
        )
    }

    async MetaStats():Promise<string> {
        const mongo = await Mongo.Client()
        const matches = await mongo.collection('matches.wz').count()
        const players = await mongo.collection('players').count()
        const performances = await mongo.collection('performances.wz').count()
        return (
            '> **Meta Stats**\n'+
            `> Players: ${commaNum(players)}\n`+
            `> Matches: ${commaNum(matches)}\n`+
            `> Performances: ${commaNum(performances)}`
        )
    }

    async PingProfile(username:string, platform:Mongo.T.CallOfDuty.Platform='ATV'):Promise<string> {
        const pingRes = await ProfileService.Ping(username, platform)
        if (!pingRes) return `> Player ${username} not found on Call of Duty API`
        return (
            `> **${username} Player Info**\n`+
            `> In network: ${String(pingRes.local)}\n`+
            `> Saved matches: ${commaNum(pingRes.matches)}`
        )
    }

    async SearchProfile(username:string):Promise<{}[]> {
        return ProfileService.Search(username)
    }

    async KPG(username:string, platform:Mongo.T.CallOfDuty.Platform='ATV'):Promise<{ kills:number, matches:number }> {
        const mongo = await Mongo.Client()
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        const props = { _id: 0, 'stats.kills': 1 } as any
        const query = {'player._id': player._id } as any
        const kills = await mongo.collection('performances.wz').find(query, props).toArray()
        return { kills: kills.map(p => p.stats.kills).reduce((a,b) => a+b, 0), matches: kills.length }
    }

    async KDR(username:string, platform:Mongo.T.CallOfDuty.Platform='ATV'):Promise<{ kills:number, deaths:number, matches:number }> {
        const mongo = await Mongo.Client()
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        const props = { _id: 0, 'stats.kills': 1 } as any
        const query = { 'player._id': player._id } as any
        const matches = await mongo.collection('performances.wz').find(query, props).toArray()
        let kills = 0, deaths = 0
        for(const match of matches) {
            kills += match.stats.kills
            deaths += match.stats.deaths
        }
        return { kills, deaths, matches: matches.length }
    }

    async DPK(username:string, platform:Mongo.T.CallOfDuty.Platform='ATV'):Promise<{ kills:number, deaths:number, damageDone: number, damageTaken:number }> {
        const mongo = await Mongo.Client()
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        const props = { _id: 0, 'stats.kills': 1, 'stats.deaths': 1, 'stats.damageDone': 1, 'stats.damageTaken': 1 } as any
        const query = { 'player._id': player._id } as any
        const matches = await mongo.collection('performances.wz').find(query, props).toArray()
        let kills = 0, deaths = 0, damageDone = 0, damageTaken = 0
        for(const match of matches) {
            kills += match.stats.kills
            deaths += match.stats.deaths
            damageDone += match.stats.damageDone
            damageTaken += match.stats.damageTaken
        }
        return { kills, deaths, damageDone, damageTaken }
    }
}

export namespace ProfileService {
    export const Ping = async (username:string, platform:Mongo.T.CallOfDuty.Platform='ATV') => {
        console.log(`[>] New player data request for ${platform}<${username}>`)
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        if (player) {
            const mongo = await Mongo.Client()
            const matches = await mongo.collection('performances.wz').find({ 'player._id': player._id }).count()
            return { platform, username, local: true, matches }
        }
        try {
            const tokens = await Mongo.CallOfDuty.Get.Auth()
            const { api } = await Mongo.CallOfDuty.Get.Platform(platform)
            const API = new CallOfDutyAPI(tokens)
            await API.Profile(username, api as any)
            return { platform, username, local: false, matches: 0 } // player exists on cod
        } catch(e) {
            console.log(`[!] Invalid player ${platform}<${username}>`)
            return false // player does not exist on cod
        }
    }
    export const Search = async (username:string) => {
        const mongo = await Mongo.Client()
        const queries = []
        const platforms = await mongo.collection('platforms').find().toArray()
        for( const { tag } of platforms ) {
            queries.push({ [`profiles.${tag.toUpperCase()}`]: { $regex: username, $options: 'i' } })
        }
        const players = await mongo.collection('players').find({ $or: queries }).toArray()
        return players.map(({ profiles }) => ({ ...profiles }))
    }
}