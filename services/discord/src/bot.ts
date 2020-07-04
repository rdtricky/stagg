import * as Mongo from '@stagg/mongo'
import { Client, Message } from 'discord.js'
import * as API from '@stagg/api'
import { commaNum, percentage, CallOfDuty } from '@stagg/util'
import * as LegacyAPI from './api'

export default class {
    protected bot:Client
    constructor(loginToken:string, jwtSecret:string, mailConfig:{user:string,pass:string}, mongoConfig:Mongo.T.Config) {
        this.ConfigureAPI(jwtSecret, mailConfig, mongoConfig)
        this.Login(loginToken)
        this.Listen()
    }
    protected ConfigureAPI(jwtSecret:string, mailConfig:{user:string,pass:string}, mongoConfig:Mongo.T.Config) {
        Mongo.Config(mongoConfig)
        LegacyAPI.JWT.Config(jwtSecret)
        LegacyAPI.Mail.Config(mailConfig)
        LegacyAPI.Mongo.Config(mongoConfig)
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
    protected TruncateOutput(output:string):string {
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
    protected async MessageController(msg:Message):Promise<void> {
        const content = msg.content.trim().replace(`<@!${this.bot.user.id}>`, ':BOT_TAG:')
        // Allow DMs without manual triggers
        const isDM = msg.channel.type as any === 'dm'
        const hasTagTrigger = content.match(/^:BOT_TAG:/)
        const hasTextTrigger = content.match(/^%/i)
        console.log(msg.author)
        if (!isDM && !hasTagTrigger && !hasTextTrigger) return
        if (`${msg.author.username}#${msg.author.discriminator}` === this.bot.user.tag) return // ignore messages from self
        const [cmd, ...args] = content.replace(/^%/, '').replace(/^:BOT_TAG:/, '').trim().replace(/\s+/g, ' ').split(' ')
        msg.channel.send('> Working on it...').then(async (sentMessage) => {
            const commandResponse = await this.CommandDispatcher(msg, cmd, ...args)
            const truncatedResponse = this.TruncateOutput(commandResponse) // truncates only if > 2k char limit
            sentMessage.edit(truncatedResponse)
        })
    }
    protected async CommandDispatcher(msg:Message, cmd:string, ...args:any):Promise<string> {
        if (!this[`cmd_${cmd.toLowerCase()}`]) return this.cmd_unrecognized()
        return await this[`cmd_${cmd.toLowerCase()}`](msg, ...args)
    }

    protected cmd_unrecognized():string {
        return this.FormatOutput(['Unrecognized command, try `help`'])
    }

    protected cmd_help():string {
        return this.FormatOutput([
            '———————————————————————————',
            '**# First time users                                                                              #**',
            '———————————————————————————',
            'Before using the bot, you must first login to your Call of Duty account at https://stagg.co/login',
            'When logging in for the first time allow a few minutes for your match history to be gathered.',
            '(Discord registration/login coming soon!)',
            '',
            '———————————————————————————',
            '**# Using the bot                                                                                  #**',
            '———————————————————————————',
            'Start messages with `%`, `@Stagg`, or DM `Stagg#4282` to trigger the bot and use the commands below; example:',
            '```',
            '% search MellowD',
            '```',
            'Available commands:',
            '- `help` Get help using the Stagg Discord bot',
            '- `meta` Get stats on the overall Stagg system',
            '- `register <email>` Register your Discord account to your email',
            '- `search <username> <platform?>` Find profiles matching your query',
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
            'Additional support may be provided on an as-needed basis in the `#help` channel here: https://discord.gg/yV2RjJK',
            '',
            'If you want this humble binary buck in your server, click the link below:',
            'https://discord.com/oauth2/authorize?client_id=723179755548967027&scope=bot&permissions=67584',
        ])
    }

    protected async cmd_meta() {
        const mongo = await Mongo.Client()
        const players = await mongo.collection('players').countDocuments()
        const matches = await mongo.collection('matches.wz').countDocuments()
        const performances = await mongo.collection('performances.wz').countDocuments()
        return this.FormatOutput([
            '```',
            `Players: ${commaNum(players)}`,
            `Matches: ${commaNum(performances)}`,
            `Enemy Records: ${commaNum(matches * 146)}`,
            '```',
        ])
    }

    protected async cmd_register(msg:Message, email:string) {
        if (!email.match(/^.+@.+\..+$/i)) return this.FormatOutput(['Invalid email address'])
        await LegacyAPI.Mail.SendConfirmation(email, { discord: msg.author.id })
        return this.FormatOutput([
            `Confirmation email sent to ${email}, check your inbox...`,
        ])
    }

    protected async cmd_search(msg:Message, username:string, platform:API.T.CallOfDuty.Platform='uno'):Promise<string> {
        const mongo = await Mongo.Client()
        const queries = []
        if (platform) {
            queries.push({ [`profiles.${platform.toLowerCase()}`]: { $regex: username, $options: 'i' } })
        } else {
            for( const p of ['uno', 'battle', 'xbl', 'psn'] ) {
                queries.push({ [`profiles.${p}`]: { $regex: username, $options: 'i' } })
            }
        }
        const players = await mongo.collection('players').find({ $or: queries }).toArray()
        const output = []
        for(const player of players) {
            for(const platformKey in player.profiles) {
                output.push(`${player.profiles[platformKey]} (${platformKey})`)
            }
        }
        return this.FormatOutput(output)
    }
    
    protected async cmd_wz(msg:Message, cmd:string, ...args:any):Promise<string> {
        return await this.cmd_wz_stats(msg, cmd, args[0], args[1])
    }

    protected async cmd_wz_stats(msg:Message, output:string, username:string, platform:API.T.CallOfDuty.Platform='uno'):Promise<string> {
        const db = await Mongo.Client()
        const player = username.trim().toLowerCase() === 'me'
            ? await db.collection('players').findOne({ discord: msg.author.id })
            : await db.collection('players').findOne({ [`profiles.${platform.toLowerCase()}`]: { $regex: username, $options: 'i' } })
        if (!player) return this.FormatOutput(['Player not found, did you forget to register? Try `help`'])
        const performances = await db.collection('performances.wz').find({ 'player._id': player._id }).toArray() as Mongo.T.CallOfDuty.Schema.Performance[]
        const staggEmpty = { games: 0, wins: 0, top5: 0, top10: 0, kills: 0, deaths: 0, downs: 0, loadouts: 0, gulagWins: 0, gulagGames: 0, damageDone: 0, damageTaken: 0 }
        const staggAll = { ...staggEmpty }
        const staggModes = {}
        for(const p of performances) {
            if (p.modeId.toLowerCase().includes('tdm') || p.modeId.toLowerCase().includes('dmz')) continue
            staggAll.games++
            staggAll.kills += p.stats.kills
            staggAll.deaths += p.stats.deaths
            staggAll.loadouts += p.loadouts.length
            staggAll.damageDone += p.stats.damageDone
            staggAll.damageTaken += p.stats.damageTaken
            staggAll.downs += p.stats.downs.reduce((a,b) => a+b, 0)
            if (p.stats.teamPlacement === 1)                  staggAll.wins++
            if (p.stats.teamPlacement <= 5)                   staggAll.top5++
            if (p.stats.teamPlacement <= 10)                  staggAll.top10++
            if (p.stats.gulagKills >= 1)                      staggAll.gulagWins++
            if (p.stats.gulagKills || p.stats.gulagDeaths)    staggAll.gulagGames++
            const mode = CallOfDuty.Warzone.modeMap[p.modeId]
            if (!mode) { // If we don't know what the game mode is say fuck it and guess quads?
                mode.type = 'br'
                mode.teamSize = 4
            }
            if (!staggModes[mode.teamSize]) staggModes[mode.teamSize] = { ...staggEmpty }
            staggModes[mode.teamSize].games++
            staggModes[mode.teamSize].kills += p.stats.kills
            staggModes[mode.teamSize].deaths += p.stats.deaths
            staggModes[mode.teamSize].loadouts += p.loadouts.length
            staggModes[mode.teamSize].damageDone += p.stats.damageDone
            staggModes[mode.teamSize].damageTaken += p.stats.damageTaken
            staggModes[mode.teamSize].downs += p.stats.downs.reduce((a,b) => a+b, 0)
            if (p.stats.teamPlacement === 1)                  staggModes[mode.teamSize].wins++
            if (p.stats.teamPlacement <= 5)                   staggModes[mode.teamSize].top5++
            if (p.stats.teamPlacement <= 10)                  staggModes[mode.teamSize].top10++
            if (p.stats.gulagKills >= 1)                      staggModes[mode.teamSize].gulagWins++
            if (p.stats.gulagKills || p.stats.gulagDeaths)    staggModes[mode.teamSize].gulagGames++
        }
        const modeOutputs = {}
        for(const teamSize of Object.keys(staggModes).sort((a,b) => Number(a) - Number(b))) {
            let modeLabel = 'None'
            switch(Number(teamSize)) {
                case 1: 
                    modeLabel = 'Solos'
                    break
                case 2: 
                    modeLabel = 'Duos'
                    break
                case 3: 
                    modeLabel = 'Trios'
                    break
                case 4: 
                    modeLabel = 'Quads'
                    break
                default:
                    modeLabel = 'Unknown'
            }
            modeOutputs[teamSize] = [
                `${modeLabel}:`,
                '--------------------------------',
                `Matches: ${commaNum(staggModes[teamSize].games)}`,
                `Wins: ${commaNum(staggModes[teamSize].wins)}`,
                `Kills: ${commaNum(staggModes[teamSize].kills)}`,
                `Downs: ${commaNum(staggModes[teamSize].downs)}`,
                `Deaths: ${commaNum(staggModes[teamSize].deaths)}`,
                `Loadouts: ${commaNum(staggModes[teamSize].loadouts)}`,
                `Win rate: ${percentage(staggModes[teamSize].wins, staggModes[teamSize].games)}%`,
                `Top 5 rate: ${percentage(staggModes[teamSize].top5, staggModes[teamSize].games)}%`,
                `Top 10 rate: ${percentage(staggModes[teamSize].top10, staggModes[teamSize].games)}%`,
                `Gulag win rate: ${percentage(staggModes[teamSize].gulagWins, staggModes[teamSize].gulagGames)}%`,
                `Kills per death: ${(staggModes[teamSize].kills/staggModes[teamSize].deaths).toFixed(2)}`,
                `Damage per kill: ${commaNum(Math.round(staggModes[teamSize].damageDone / staggModes[teamSize].kills))}`,
                `Damage per death: ${commaNum(Math.round(staggModes[teamSize].damageTaken / staggModes[teamSize].deaths))}`,
            ]
        }
        const combinedOutput = [
            'Combined:',
            '--------------------------------',
            `Matches: ${commaNum(staggAll.games)}`,
            `Wins: ${commaNum(staggAll.wins)}`,
            `Kills: ${commaNum(staggAll.kills)}`,
            `Downs: ${commaNum(staggAll.downs)}`,
            `Deaths: ${commaNum(staggAll.deaths)}`,
            `Loadouts: ${commaNum(staggAll.loadouts)}`,
            `Win rate: ${percentage(staggAll.wins, staggAll.games)}%`,
            `Top 5 rate: ${percentage(staggAll.top5, staggAll.games)}%`,
            `Top 10 rate: ${percentage(staggAll.top10, staggAll.games)}%`,
            `Gulag win rate: ${percentage(staggAll.gulagWins, staggAll.gulagGames)}%`,
            `Kills per death: ${(staggAll.kills/staggAll.deaths).toFixed(2)}`,
            `Damage per kill: ${commaNum(Math.round(staggAll.damageDone / staggAll.kills))}`,
            `Damage per death: ${commaNum(Math.round(staggAll.damageTaken / staggAll.deaths))}`,
        ]
        const outputLines = []
        switch(output.toLowerCase()) {
            case 'combined':
                outputLines.push(...combinedOutput)
                break
            case 'solos':
                outputLines.push(...(modeOutputs[1] || []))
                break
            case 'duos':
                outputLines.push(...(modeOutputs[2] || []))
                break
            case 'trios':
                outputLines.push(...(modeOutputs[3] || []))
                break
            case 'quads':
                outputLines.push(...(modeOutputs[4] || []))
                break
            case 'all':
            default:
                for(const teamSize in modeOutputs) outputLines.push('', ...modeOutputs[teamSize])
                outputLines.push('', ...combinedOutput)
                break
        }
        return this.FormatOutput([
            `**${username}** (${player.uno})`,
            `Full profile: https://stagg.co/wz/${player.profiles?.uno?.split('#').join('@')}`,
            '```',
            ...outputLines,
            '```',
        ])
    }
}
