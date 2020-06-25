import { CallOfDuty } from '@stagg/scrape'
import { T as MongoTypes, CallOfDuty } from '@stagg/mongo'
import config from './config'



export class WarzoneScraper {
    private db:MongoTypes.Client
    private next:number
    private attempts:number
    private complete:boolean
    private logger:Function
}


export class Warzone {
    private db:any
    private next:number
    private attempts:number
    private complete:boolean
    private logger:Function
    public player:Mongo.Schema.Player
    public profile:Mongo.Types.UserParams
    public platform:Mongo.Schema.Platform
    public matches:Types.Response.Warzone.Match[]
    constructor(logger?:Function) {
        this.logger = logger || console.log
        this.Run()
    }
    async Run() {
        this.db = await Mongo.Client()
        await this.InfiniteLoop()
    }
    async InfiniteLoop() {
        while(true) {
            this.logger('[>] Looking for players to initialize...')
            try {
                await this.SelectProfile()
            } catch(e) { // no players found, wait...
                this.logger(`    ${e}`)
                this.logger(`    Waiting ${config.scrape.wait}ms`)
                await delay(config.scrape.wait)
                continue
            }
            this.logger(`[>] Scrape CallOfDutyAPI for ${this.profile.platform}<${this.profile.username}>`)
            await this.DownloadMatchHistory()
            await this.UpdatePlayer()
        }
    }
    async SelectProfile() {
        let player = await this.db.collection('players').findOne({ 'api.updated': { $exists: false } })
        if (!player) {
            [ player ] = await this.db.collection('players').find({ 'api.updated': { $exists: true } }).sort({ 'api.updated': 1 }).toArray()
        }
        if (!player) {
            throw 'No players found to scrape'
        }
        this.player = player
        const [platform] = Object.keys(this.player.profiles)
        const [username] = Object.values(this.player.profiles)
        this.profile = { platform, username }
        // Fetch platform data for API requests
        this.platform = await this.db.collection('platforms').findOne({ tag: this.profile.platform })
        await this.db.collection('players').updateOne({ _id: this.player._id }, { $set: { 'api.updated': Math.floor(Date.now() / 1000) } })

    }
    async DownloadMatchHistory() {
        this.next = 0
        this.attempts = 0
        this.matches = []
        this.complete = false
        if (this.player.api.next) {
            this.next = this.player.api.next
        }
        while(!this.complete && this.attempts <= config.api.retry) {
            await this.FetchMatchHistorySegment()
            try {
                await this.RecordMatchHistory()
            } catch(e) {
                this.logger(`    ${e}`)
            }
        }
        // We reached the end or exhausted all our attempts, process the data and move on...
        this.logger(`    Exiting loop...`)
    }
    async FetchMatchHistorySegment() {
        try {
            const res = await Request.Tokens(this.player.api.auth).Warzone.Matches(this.platform.api, this.profile.username, this.next)
            if (!res.matches) {
                throw `No matches returned (end:${this.next})`
            }
            this.attempts = 0 // reset attempts on success
            this.matches = res.matches.filter((m:Types.Response.Warzone.Match) => m) // filter out null matches
            this.logger(`    Found ${this.matches.length} matches (end:${this.next})...`)
            this.next = Math.min(...this.matches.map((m:Types.Response.Warzone.Match) => m.utcStartSeconds - 300)) * 1000
            // If we get less than 20 matches we know we are at the end of their match history
            // Without a definitive end to their match history, we wait for attempts to trigger close
            if (this.matches.length < 20) {
                this.complete = true
            }
        } catch(err) {
            this.attempts++
            if (this.attempts < config.api.retry) {
                this.logger(`    ${err}... waiting ${config.api.delay}ms for attempt #${this.attempts + 1}...`)
                await delay(config.api.delay)
            }
        }
    }
    async RecordMatchHistory() {
        if (!this.matches.length && !this.complete) {
            return
        }
        for(const match of this.matches) {
            const normalizedPerformance = Normalize.Warzone.Performance(match, this.player)
            const perfRecord = await this.db.collection('performances.wz').findOne({ matchId: normalizedPerformance.matchId })
            if (!perfRecord) {
                this.logger(`    Saving performance for match ${match.matchID}`)
                await this.db.collection('performances.wz').insertOne(normalizedPerformance)
            }
            // Matches may not always be present as they're ignored if they lack rankedTeams
            const normalizedMatch = Normalize.Warzone.Match(match) as Mongo.Schema.Match
            const matchRecord = await this.db.collection('matches.wz').findOne({ matchId: normalizedMatch.matchId })
            if (!match.rankedTeams) {
                this.logger(`    Skipping match ${match.matchID} - missing teams`)
                continue // Some BR TDMs have been missing rankedTeams, skip it for now and see if it comes back eventually (it's present on some)
            }
            if (!matchRecord) {
                this.logger(`    Saving generic record for match ${match.matchID}`)
                normalizedMatch.teams = Normalize.Warzone.Teams(match)
                await this.db.collection('matches.wz').insertOne(normalizedMatch)
            }
        }
    }
    async UpdatePlayer() {
        this.player.api = { ...this.player.api, next: this.next }
        if (!this.matches.length) {
            this.player.api.failures = (this.player.api.failures || 0) + 1
        }
        if (this.player.api.failures >= config.api.failures) {
            this.player.api.next = 0
            this.player.api.failures = 0
            this.logger(`    Resetting ${this.profile.username}...`)
        }
        await this.db.collection('players').updateOne({ _id: this.player._id }, { $set: { api: this.player.api } })
        this.logger(`    Updated ${this.profile.username}...`)
    }
}
