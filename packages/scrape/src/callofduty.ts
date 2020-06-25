import { Db } from 'mongodb'
import * as API from '@stagg/api'
import * as Mongo from '@stagg/mongo'
import { T } from '.'
const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
export class All {
    private db                : Db
    private scrapers          : { [key:string]: Player }
    private readonly options  : Partial<T.CallOfDuty.Options>
    constructor(options:Partial<T.CallOfDuty.Options>) {
        this.scrapers = {}
        this.options = options
        Mongo.Config(options.db.config)
        this.Init()
    }
    async Init() {
        this.db = await Mongo.Client()
        setInterval(this.Run.bind(this), this.options.delay)
    }
    async Run() {
        const dbPlayers = await this.db.collection('players').find().toArray()
        for(const player of dbPlayers) {
            if (!this.scrapers[player._id]) this.InitScraper(player)
        }
    }
    InitScraper(player) {
        const username = player.profiles.ATV
        console.log('[>] Instantiating new scraper for', username)
        const passableOptions = { ...this.options }
        passableOptions.db.player = player
        passableOptions.logger = () => {}
        this.scrapers[player._id] = new Player(username, 'uno', player.api.auth, passableOptions)
    }
}
export class Player {
    private db                : Db
    private failures          : number
    private complete          : boolean
    private timestamp         : number
    private matchIds          : string[]
    private player            : Partial<Mongo.T.CallOfDuty.Schema.Player>
    private readonly username : string
    private readonly platform : API.T.CallOfDuty.Platform
    private readonly game     : API.T.CallOfDuty.Game
    private readonly mode     : API.T.CallOfDuty.Mode
    private readonly API      : API.CallOfDuty
    private readonly options  : T.CallOfDuty.Options = {
        limit: 0,
        retry: 3,
        delay: 500,
        refetch: true,
        timestamp: 0,
        perpetual: true,
        callback: ()=>{},
        logger: console.log,
        timestampOffset: 300,
    }
    constructor(username:string, platform:API.T.CallOfDuty.Platform, tokens:API.T.CallOfDuty.Tokens, options?:Partial<T.CallOfDuty.Options>) {
        this.username = username
        this.platform = platform
        this.API = new API.CallOfDuty(tokens)
        this.options = {...this.options, ...options}
        this.Init(options.db)
    }
    async Init(db:T.CallOfDuty.Options.Database) {
        if (db) {
            Mongo.Config(db.config)
            this.db = await Mongo.Client()
            this.player = db.player
        }
        this.Run()
    }
    async Run() {
        this.Reset()
        if (!this.options.perpetual) return await this.Fetch()
        while(!this.complete && this.failures < this.options.retry) {
            await this.Fetch()
            await delay(this.options.delay)
        }
        this.options.logger(`[${this.complete ? '+' : '!'}] Scraping ${this.complete ? 'complete' : 'failed'} for ${this.platform}/${this.username}`)
        this.Run()
    }
    async OnResponse(res:API.T.CallOfDuty.Res.Warzone.Matches) {
        this.options.callback(res)
        if (this.db) {
            await this.SaveToDb(res)
        }
    }
    async SaveToDb(res:API.T.CallOfDuty.Res.Warzone.Matches) {
        for(const match of res.matches) {
            const normalizedPerformance = Normalize.Warzone.Performance(match, this.player)
            const perfRecord = await this.db.collection('performances.wz').findOne({ matchId: normalizedPerformance.matchId })
            if (!perfRecord) {
                this.options.logger(`    Saving performance for match ${match.matchID}`)
                await this.db.collection('performances.wz').insertOne(normalizedPerformance)
            }
            // Matches may not always be present as they're ignored if they lack rankedTeams
            const normalizedMatch = Normalize.Warzone.Match(match) as Mongo.T.CallOfDuty.Schema.Match
            const matchRecord = await this.db.collection('matches.wz').findOne({ matchId: normalizedMatch.matchId })
            if (!match.rankedTeams) {
                this.options.logger(`    Skipping match ${match.matchID} - missing teams`)
                continue // Some BR TDMs have been missing rankedTeams, skip it for now and see if it comes back eventually (it's present on some)
            }
            if (!matchRecord) {
                this.options.logger(`    Saving generic record for match ${match.matchID}`)
                normalizedMatch.teams = Normalize.Warzone.Teams(match)
                await this.db.collection('matches.wz').insertOne(normalizedMatch)
            }
        }
        // this.player.api = { ...this.player.api, next: this.timestamp }
        // if (!res.matches.length) {
        //     this.player.api.failures = (this.player.api.failures || 0) + 1
        // }
        // if (this.player.api.failures >= this.options.failures) {
        //     this.player.api.next = 0
        //     this.player.api.failures = 0
        //     this.logger(`    Resetting ${this.profile.username}...`)
        // }
        // await this.db.collection('players').updateOne({ _id: this.player._id }, { $set: { api: this.player.api } })
        // this.logger(`    Updated ${this.profile.username}...`)
    }
    Reset() {
        this.failures = 0
        this.matchIds = []
        this.complete = false
        this.timestamp = this.options.timestamp
    }
    NextTimestamp(matches:API.T.CallOfDuty.Res.Warzone.Match[]):number {
        const timestamps = matches.map(m => m.utcEndSeconds)
        const edgeTimestamp = Math.min(...timestamps)
        const offsetTimestamp = edgeTimestamp - this.options.timestampOffset
        return offsetTimestamp * 1000 // convert seconds to microseconds
    }
    async Fetch() {
        this.options.logger(`[>] Scraping ${this.platform}/${this.username} @ ${this.timestamp}`)
        try {
            const res = await this.API.Matches(this.username, this.platform, this.mode, this.game, this.timestamp)
            this.OnResponse(res)
            this.timestamp = this.NextTimestamp(res.matches)
            const newMatchIds = res.matches.filter(m => m).map(m => m.matchID)
            this.matchIds = [...this.matchIds, ...newMatchIds]
            const lessThan20 = newMatchIds.length < 20
            const passedLimit = this.options.limit && this.matchIds.length >= this.options.limit
            this.complete = lessThan20 || passedLimit
            this.failures = 0
        } catch(e) {
            if (this.failures < this.options.retry) {
                this.failures++
                await this.Fetch()
            }
        }
    }
}


export namespace Normalize {
    const getStat = (stats:any, stat:string) => stats && !isNaN(Number(stats[stat])) ? Number(stats[stat]) : 0
    export const Loadout = (loadout:API.T.CallOfDuty.Res.Loadout) => ({
        primary: {
            weapon: loadout.primaryWeapon.name,
            variant: Number(loadout.primaryWeapon.variant),
            attachments: loadout.primaryWeapon.attachments.filter(a => a.name !== 'none').map(a => a.name),
        },
        secondary: {
            weapon: loadout.secondaryWeapon.name,
            variant: Number(loadout.secondaryWeapon.variant),
            attachments: loadout.secondaryWeapon.attachments.filter(a => a.name !== 'none').map(a => a.name),
        },
        lethal: loadout.lethal.name,
        tactical: loadout.tactical.name,
        perks: loadout.perks.filter(p => p.name !== 'specialty_null').map(perk => perk.name),
        killstreaks: loadout.killstreaks.filter(ks => ks.name !== 'none').map(ks => ks.name),
    })
    export namespace Warzone {
        export const Match = (match:API.T.CallOfDuty.Res.Warzone.Match) => ({
            mapId: match.map,
            modeId: match.mode,
            matchId: match.matchID,
            endTime: match.utcEndSeconds,
            startTime: match.utcStartSeconds,
        })
        export const Teams = (match:API.T.CallOfDuty.Res.Warzone.Match) =>
            match.rankedTeams.map((team:API.T.CallOfDuty.Res.Warzone.Match.Team) => ({
                name: team.name,
                placement: team.placement,
                time: team.time,
                players: team.players.map((player:API.T.CallOfDuty.Res.Warzone.Match.Team.Player) => ({
                    uno: player.uno,
                    username: player.username.replace(/^(\[[^\]]+\])?(.*)$/, '$2'),
                    clantag: player.username.replace(/^(\[[^\]]+\])?(.*)$/, '$1') || null,
                    platform: player.platform,
                    rank: player.rank,
                    loadouts: player.loadouts?.map((loadout:API.T.CallOfDuty.Res.Loadout) => Normalize.Loadout(loadout)) || [],
                    stats: {
                        rank: getStat(player.playerStats, 'rank'),
                        score: getStat(player.playerStats, 'score'),
                        kills: getStat(player.playerStats, 'kills'),
                        deaths: getStat(player.playerStats, 'deaths'),
                        damageDone: getStat(player.playerStats, 'damageDone'),
                        damageTaken: getStat(player.playerStats, 'damageTaken'),
                        wallBangs: getStat(player.playerStats, 'wallBangs'),
                        headshots: getStat(player.playerStats, 'headshots'),
                        executions: getStat(player.playerStats, 'executions'),
                        assists: getStat(player.playerStats, 'assists'),
                        nearmisses: getStat(player.playerStats, 'nearmisses'),
                        longestStreak: getStat(player.playerStats, 'longestStreak'),
                        timePlayed: getStat(player.playerStats, 'timePlayed'),
                        distanceTraveled: getStat(player.playerStats, 'distanceTraveled'),
                        percentTimeMoving: getStat(player.playerStats, 'percentTimeMoving'),
                    }
                })),
            }))
        export const Performance = (match:API.T.CallOfDuty.Res.Warzone.Match, player:Partial<Mongo.T.CallOfDuty.Schema.Player>) => {
            // Count downs
            let downs = []
            const downKeys = Object.keys(match.playerStats).filter(key => key.includes('objectiveBrDownEnemyCircle'))
            for(const key of downKeys) {
                const circleIndex = Number(key.replace('objectiveBrDownEnemyCircle', ''))
                downs[circleIndex] = getStat(match.playerStats, key)
            }
            return {
                mapId: match.map,
                modeId: match.mode,
                matchId: match.matchID,
                endTime: match.utcEndSeconds,
                startTime: match.utcStartSeconds,
                player: {
                    _id: player._id,
                    team: match.player.team,
                    username: match.player.username,
                    clantag: match.player.clantag,
                },
                stats: {
                    rank: getStat(match.playerStats, 'rank'),
                    score: getStat(match.playerStats, 'score'),
                    kills: getStat(match.playerStats, 'kills'),
                    deaths: getStat(match.playerStats, 'deaths'),
                    downs,
                    gulagKills: getStat(match.playerStats, 'gulagKills'),
                    gulagDeaths: getStat(match.playerStats, 'gulagDeaths'),
                    eliminations: getStat(match.playerStats, 'objectiveLastStandKill'),
                    damageDone: getStat(match.playerStats, 'damageDone'),
                    damageTaken: getStat(match.playerStats, 'damageTaken'),
                    teamWipes: getStat(match.playerStats, 'objectiveTeamWiped'),
                    revives: getStat(match.playerStats, 'objectiveReviver'),
                    contracts: getStat(match.playerStats, 'objectiveBrMissionPickupTablet'),
                    lootCrates: getStat(match.playerStats, 'objectiveBrCacheOpen'),
                    buyStations: getStat(match.playerStats, 'objectiveBrKioskBuy'),
                    assists: getStat(match.playerStats, 'assists'),
                    executions: getStat(match.playerStats, 'executions'),
                    headshots: getStat(match.playerStats, 'headshots'),
                    wallBangs: getStat(match.playerStats, 'wallBangs'),
                    nearMisses: getStat(match.playerStats, 'nearmisses'),
                    clusterKills: getStat(match.playerStats, 'objectiveMedalScoreSsKillTomaStrike'),
                    airstrikeKills: getStat(match.playerStats, 'objectiveMedalScoreKillSsRadarDrone'),
                    longestStreak: getStat(match.playerStats, 'longestStreak'),
                    trophyDefense: getStat(match.playerStats, 'objectiveTrophyDefense'),
                    munitionShares: getStat(match.playerStats, 'objectiveMunitionsBoxTeammateUsed'),
                    missileRedirects: getStat(match.playerStats, 'objectiveManualFlareMissileRedirect'),
                    equipmentDestroyed: getStat(match.playerStats, 'objectiveDestroyedEquipment'),
                    percentTimeMoving: getStat(match.playerStats, 'percentTimeMoving'),
                    distanceTraveled: getStat(match.playerStats, 'distanceTraveled'),
                    teamSurvivalTime: getStat(match.playerStats, 'teamSurvivalTime'),
                    teamPlacement: getStat(match.playerStats, 'teamPlacement'),
                    timePlayed: getStat(match.playerStats, 'timePlayed'),
                    xp: {
                        score: getStat(match.playerStats, 'scoreXp'),
                        match: getStat(match.playerStats, 'matchXp'),
                        bonus: getStat(match.playerStats, 'bonusXp'),
                        medal: getStat(match.playerStats, 'medalXp'),
                        misc: getStat(match.playerStats, 'miscXp'),
                        challenge: getStat(match.playerStats, 'challengeXp'),
                        total: getStat(match.playerStats, 'totalXp'),
                    }
                },
                loadouts: match.player.loadout.map(loadout => Normalize.Loadout(loadout)),
            }
        }
    }
}
