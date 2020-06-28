import * as Mongo from '@stagg/mongo'
import * as DataSources from '@stagg/datasources'
export const Match = async (req:Express.Request|any,res:Express.Response|any) => {
    const { matchId } = req.params
    if (!matchId) {
        return res.status(400).send({ error: 'invalid matchId' })
    }
    const mongo = await Mongo.Client()
    const match = await mongo.collection('matches.wz').findOne({ matchId })
    res.status(200).send(match)
}
export const Login = async (req:Express.Request|any,res:Express.Response|any) => {
    try {
        const API = new DataSources.CallOfDuty()
        const { email, password } = req.body
        const { xsrf, atkn, sso } = await API.Login(email, password)
        await Mongo.CallOfDuty.Put.Player({ email, auth: { xsrf, atkn, sso } })
        console.log(`[+] Created player for ${email}`)
        res.status(201).send({ email })
    } catch(error) {
        res.status(500).send({ error })
    }
}
export namespace Profile {
    export const Search = async (req:Express.Request|any,res:Express.Response|any) => {
        const { username } = req.params
        res.send(await ProfileService.Search(username))
    }
    export const Ping = async (req:Express.Request|any,res:Express.Response|any) => {
        const { platform, username } = req.params
        const pingRes = await ProfileService.Ping(username, platform)
        if (pingRes) return res.send(pingRes)
        res.status(404).send({ error: 'user does not exist' }) // player does not exist on cod
    }
    export namespace Warzone {
        export const Diff = async (req:Express.Request|any,res:Express.Response|any) => {
            const { matchIds } = req.body
            const { platform, username } = req.params
            const matchIdsDiff = await Mongo.CallOfDuty.Get.Warzone.MatchIds(username, platform, matchIds)
            res.status(200).send(matchIdsDiff)
        }
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