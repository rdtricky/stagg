import { T, Client } from '.'

export namespace CallOfDuty {
    export const Platforms = [
        {
            tag: 'ATV',
            api: 'uno',
            name: 'Activision'
        },
        {
            tag: 'BTL',
            api: 'battle',
            name: 'Battle.net'
        },
        {
            tag: 'XBL',
            api: 'xbl',
            name: 'Xbox Live'
        },
        {
            tag: 'PSN',
            api: 'psn',
            name: 'PlayStation Network'
        },
    ] as T.CallOfDuty.Schema.Platform[]
    
    export const Bootstrap = async () => {
        const mongo = await Client()
        for(const platform of Platforms) {
            if (!await Get.Platform(platform.tag)) {
                await mongo.collection('platforms').insertOne(platform)
            }
        }
    }
    
    export namespace Get {
        export const Auth = async (username:string='', platform:T.CallOfDuty.Platform='ATV') => {
            if (username) {
                const player = await Player(username, platform)
                if (player?.api?.auth)
                    return player.api.auth
            }
            const mongo = await Client()
            const { api: { auth } } = await mongo.collection('players').findOne({})
            return auth
        }
        export const Player = async (username:string, platform:T.CallOfDuty.Platform):Promise<T.CallOfDuty.Schema.Player> => {
            const mongo = await Client()
            return mongo.collection('players').findOne({ [`profiles.${platform.toUpperCase()}`]: { $regex: username, $options: 'i' } })
        }
        export const Platform = async (platformTag:T.CallOfDuty.Platform):Promise<T.CallOfDuty.Schema.Platform> => {
            const mongo = await Client()
            return mongo.collection('platforms').findOne({ tag: { $regex: platformTag, $options: 'i' } })
        }
        export namespace Warzone {
            export const MatchIds = async (username:string, platform:T.CallOfDuty.Platform, matchIds?:string[]):Promise<string[]> => {
                const mongo = await Client()
                const player = await Player(username, platform)
                if (!player) {
                    return []
                }
                const props = { _id: 0, matchId: 1 } as any
                const query = { "player._id": player._id } as any
                if (matchIds) {
                    query.matchId = { $nin: matchIds }
                }
                const performanceMatchIds = await mongo.collection('performances.wz').find(query, props).toArray()
                return performanceMatchIds.map(p => p.matchId)
            }
            export const Performances = async (username:string, platform:T.CallOfDuty.Platform, matchIds?:string[]):Promise<T.CallOfDuty.Schema.Performance[]> => {
                const mongo = await Client()
                const player = await Player(username, platform)
                if (!player) {
                    return []
                }
                return !matchIds 
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
