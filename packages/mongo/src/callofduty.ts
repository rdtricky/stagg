import { T as API } from '@stagg/api'
import { T, Client } from '.'

export namespace CallOfDuty {
    export namespace Get {
        export const Auth = async (username:string='', platform:API.CallOfDuty.Platform='uno') => {
            if (username) {
                const player = await Player(username, platform)
                if (player?.auth)
                    return player.auth
            }
            const mongo = await Client()
            const { api: { auth } } = await mongo.collection('players').findOne({})
            return auth
        }
        export const Player = async (username:string, platform:API.CallOfDuty.Platform='uno'):Promise<T.CallOfDuty.Schema.Player> => {
            const mongo = await Client()
            return mongo.collection('players').findOne({ [`profiles.${platform.toLowerCase()}`]: { $regex: username, $options: 'i' } })
        }
        export namespace Warzone {
            export const MatchIds = async (username:string, platform:API.CallOfDuty.Platform='uno', matchIds:string[]=[]):Promise<string[]> => {
                const mongo = await Client()
                const player = await Player(username, platform)
                if (!player) return []
                const props = { _id: 0, matchId: 1 } as any
                const query = { "player._id": player._id, matchId: { $nin: matchIds } } as any
                const performanceMatchIds = await mongo.collection('performances.wz').find(query, props).toArray()
                return performanceMatchIds.map(p => p.matchId)
            }
            export const Performances = async (username:string, platform:API.CallOfDuty.Platform='uno', matchIds:string[]=[]):Promise<T.CallOfDuty.Schema.Performance[]> => {
                const mongo = await Client()
                const player = await Player(username, platform)
                if (!player) return []
                return !matchIds?.length
                    ? mongo.collection('performances.wz').find({ "player._id": player._id }).toArray()
                    : mongo.collection('performances.wz').find({ "player._id": player._id, matchId: { $in: matchIds } }).toArray()
            }
        }
    }
    
    export namespace Put {
        export const Player = async (player:T.CallOfDuty.Schema.Player.Scaffold) => {
            const mongo = await Client()
            return mongo.collection('players').insertOne(player)
        }
    }
}
