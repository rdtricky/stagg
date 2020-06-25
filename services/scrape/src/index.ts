import * as Mongo from '@stagg/mongo'
import * as Scrape from '@stagg/scrape'
import cfg from './config'

(async () => {
    Mongo.Config(cfg.mongo)
    const db = await Mongo.Client()
    const players = await db.collection('players').find().toArray()
    const [player] = players
    const username = player.profiles.ATV
    new Scrape.CallOfDuty(username, 'uno', player.api.auth, (res) => {
        console.log('Got', res.matches.map(m => m.matchID).length, 'matches')
    })
    // for(const player of players) {
    //     const username = player.profiles.ATV
    //     new Scrape.CallOfDuty(username, 'uno', player.api.auth, (res) => {
    //         console.log(res.matches.map(m => m.matchID))
    //     })
    // }
})()

// async RecordMatchHistory() {
//     if (!this.matches.length && !this.complete) {
//         return
//     }
//     for(const match of this.matches) {
//         const normalizedPerformance = Normalize.Warzone.Performance(match, this.player)
//         const perfRecord = await this.db.collection('performances.wz').findOne({ matchId: normalizedPerformance.matchId })
//         if (!perfRecord) {
//             this.logger(`    Saving performance for match ${match.matchID}`)
//             await this.db.collection('performances.wz').insertOne(normalizedPerformance)
//         }
//         // Matches may not always be present as they're ignored if they lack rankedTeams
//         const normalizedMatch = Normalize.Warzone.Match(match) as Mongo.Schema.Match
//         const matchRecord = await this.db.collection('matches.wz').findOne({ matchId: normalizedMatch.matchId })
//         if (!match.rankedTeams) {
//             this.logger(`    Skipping match ${match.matchID} - missing teams`)
//             continue // Some BR TDMs have been missing rankedTeams, skip it for now and see if it comes back eventually (it's present on some)
//         }
//         if (!matchRecord) {
//             this.logger(`    Saving generic record for match ${match.matchID}`)
//             normalizedMatch.teams = Normalize.Warzone.Teams(match)
//             await this.db.collection('matches.wz').insertOne(normalizedMatch)
//         }
//     }
// }
// async UpdatePlayer() {
//     this.player.api = { ...this.player.api, next: this.next }
//     if (!this.matches.length) {
//         this.player.api.failures = (this.player.api.failures || 0) + 1
//     }
//     if (this.player.api.failures >= config.api.failures) {
//         this.player.api.next = 0
//         this.player.api.failures = 0
//         this.logger(`    Resetting ${this.profile.username}...`)
//     }
//     await this.db.collection('players').updateOne({ _id: this.player._id }, { $set: { api: this.player.api } })
//     this.logger(`    Updated ${this.profile.username}...`)
// }
