import * as API from '@stagg/api'
import * as Mongo from '@stagg/mongo'
import { Client, Message } from 'discord.js'
import * as DataSources from '@stagg/datasources'
import { commaNum, percentage } from '@stagg/util'

export default class {
    protected bot:Client
    constructor(loginToken:string, jwtSecret:string, mongoConfig:Mongo.T.Config) {
        this.ConfigureAPI(jwtSecret, mongoConfig)
        this.Login(loginToken)
        this.Listen()
    }
    protected ConfigureAPI(jwtSecret:string, mongoConfig:Mongo.T.Config) {
        Mongo.Config(mongoConfig)
        API.JWT.Config(jwtSecret)
        API.Mongo.Config(mongoConfig)
    }
    protected Login(loginToken:string) {
        this.bot = new Client()
        this.bot.login(loginToken)
    }
    protected Listen() {
        this.bot.on('ready', () => console.log(`[+] Discord Bot logged in as ${this.bot.user.tag}`))
        this.bot.on('message', async (msg:Message) => this.MessageController(msg))
    }
    protected FormatOutput(msgLines:string[]):string {
        let output = ''
        for(const line of msgLines) output += `> ${line}\n`
        return output
    }
    protected async MessageController(msg:Message):Promise<void> {
        const content = msg.content.trim().replace(`<@!${this.bot.user.id}>`, ':BOT_TAG:')
        // Allow DMs without manual triggers
        const isDM = msg.channel.type as any === 'dm'
        const hasTagTrigger = content.match(/^:BOT_TAG:/)
        const hasTextTrigger = content.match(/^%/i)
        if (!isDM && !hasTagTrigger && !hasTextTrigger) return
        if (`${msg.author.username}#${msg.author.discriminator}` === this.bot.user.tag) return // ignore messages from self
        const [cmd, ...args] = content.replace(/^%/, '').replace(/^:BOT_TAG:/, '').trim().replace(/\s+/g, ' ').split(' ')
        const commandResponse = await this.CommandDispatcher(cmd, ...args)
        msg.channel.send(commandResponse)
    }
    protected async CommandDispatcher(cmd:string, ...args:any):Promise<string> {
        if (!this[`cmd_${cmd}`]) return this.cmd_unrecognized()
        return await this[`cmd_${cmd}`](...args)
    }

    protected cmd_unrecognized():string {
        return this.FormatOutput(['Unrecognized command, try `help`'])
    }

    protected cmd_help():string {
        return this.FormatOutput([
            'Start messages with `%`, `@Stagg`, or DM `Stagg#4282` to trigger the bot',
            'Use CLI-style space-separated commands and arguments.',
            'eg: Get Warzone stats for `MellowD#6992980`',
            '```% wz stats MellowD#6992980```',
            'Available commands:',
            '- `help` Get help using the Stagg Discord bot',
            '- `meta` Get stats on the overall Stagg service',
            '- `connect` Add the Stagg bot to your own Discord',
            '- `search <username>` Find profiles matching your query',
            '- `wz stats <username> <platform?>` Get aggregate stats for player',
            '',
            'Any arguments that end with `?` are optional (eg: `<platform?>`); default values are listed below:',
            '- `<platform?>` uno (Activision)',
            '',
            'Please note that aggregate commands (`wz stats`, etc) process your _entire match history_ so please be patient, it is most likely fetching hundreds or thousands of matches.',
        ])
    }

    protected cmd_connect():string {
        return this.FormatOutput([
            'Click below to authorize the Stagg bot for your Discord server',
            'https://discord.com/oauth2/authorize?client_id=723179755548967027&scope=bot&permissions=67584',
        ])
    }

    protected async cmd_wz(cmd:string, ...args:any):Promise<string> {
        if (!this[`cmd_wz_${cmd}`]) return this.cmd_unrecognized()
        return await this[`cmd_wz_${cmd}`](...args)
    }

    protected async cmd_wz_stats(username:string, platform:DataSources.T.CallOfDuty.Platform='uno'):Promise<string> {
        const db = await Mongo.Client()
        const player = await db.collection('players').findOne({ [`profiles.${platform}`]: username })
        if (!player) return this.FormatOutput(['Player not found, did you forget to register? Try `help`'])
        const performances = await db.collection('performances.wz').find({ 'player._id': player._id }).toArray() as Mongo.T.CallOfDuty.Schema.Performance[]
        const brPerformances = performances.filter(p => !p.modeId.toLowerCase().includes('tdm') && !p.modeId.toLowerCase().includes('dmz'))
        const staggEmpty = { games: 0, wins: 0, top5: 0, top10: 0, kills: 0, deaths: 0, loadouts: 0, gulagWins: 0, gulagGames: 0, damageDone: 0, damageTaken: 0 }
        const staggAll = { ...staggEmpty }
        const staggSolos = { ...staggEmpty }
        const staggDuos = { ...staggEmpty }
        const staggTrios = { ...staggEmpty }
        const staggQuads = { ...staggEmpty }
        for(const p of brPerformances) {
            staggAll.games++
            staggAll.kills += p.stats.kills
            staggAll.deaths += p.stats.deaths
            staggAll.loadouts += p.loadouts.length
            staggAll.damageDone += p.stats.damageDone
            staggAll.damageTaken += p.stats.damageTaken
            if (p.stats.teamPlacement === 1)                  staggAll.wins++
            if (p.stats.teamPlacement <= 5)                   staggAll.top5++
            if (p.stats.teamPlacement <= 10)                  staggAll.top10++
            if (p.stats.gulagKills >= 1)                      staggAll.gulagWins++
            if (p.stats.gulagKills || p.stats.gulagDeaths)    staggAll.gulagGames++
        }
        return this.FormatOutput([
            `${username} Aggregate Stats:`,
            '--------------------------------',
            `Games played: ${commaNum(staggAll.games)}`,
            `Total wins: ${commaNum(staggAll.wins)}`,
            `Total kills: ${commaNum(staggAll.kills)}`,
            `Total deaths: ${commaNum(staggAll.deaths)}`,
            `Total damage done: ${commaNum(staggAll.damageDone)}`,
            `Total damage taken: ${commaNum(staggAll.damageTaken)}`,
            `Win rate: ${percentage(staggAll.wins, staggAll.games)}%`,
            `Top 5 rate: ${percentage(staggAll.top5, staggAll.games)}%`,
            `Top 10 rate: ${percentage(staggAll.top10, staggAll.games)}%`,
            `Gulag win rate: ${percentage(staggAll.gulagWins, staggAll.gulagGames)}%`,
            `Damage per kill: ${commaNum(Math.round(staggAll.damageDone / staggAll.kills))}`,
            `Damage per death: ${commaNum(Math.round(staggAll.damageTaken / staggAll.deaths))}`,
        ])
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

    async PingProfile(username:string, platform:DataSources.T.CallOfDuty.Platform='uno'):Promise<string> {
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

    async KPG(username:string, platform:DataSources.T.CallOfDuty.Platform='uno'):Promise<{ kills:number, matches:number }> {
        const mongo = await Mongo.Client()
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        const props = { _id: 0, 'stats.kills': 1 } as any
        const query = {'player._id': player._id } as any
        const kills = await mongo.collection('performances.wz').find(query, props).toArray()
        return { kills: kills.map(p => p.stats.kills).reduce((a,b) => a+b, 0), matches: kills.length }
    }

    async KDR(username:string, platform:DataSources.T.CallOfDuty.Platform='uno'):Promise<{ kills:number, deaths:number, matches:number }> {
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

    async DPK(username:string, platform:DataSources.T.CallOfDuty.Platform='uno'):Promise<{ kills:number, deaths:number, damageDone: number, damageTaken:number }> {
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
    export const Ping = async (username:string, platform:DataSources.T.CallOfDuty.Platform='uno') => {
        console.log(`[>] New player data request for ${platform}<${username}>`)
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        if (player) {
            const mongo = await Mongo.Client()
            const matches = await mongo.collection('performances.wz').find({ 'player._id': player._id }).count()
            return { platform, username, local: true, matches }
        }
        try {
            const tokens = await Mongo.CallOfDuty.Get.Auth()
            const API = new DataSources.CallOfDuty(tokens)
            await API.Profile(username, platform)
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