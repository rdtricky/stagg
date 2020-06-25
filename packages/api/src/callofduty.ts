import deprecatedRequest from 'request'
import axios, { AxiosRequestConfig } from 'axios'

export class CallOfDuty {
    private readonly tokens:T.CallOfDuty.Tokens
    constructor(tokens:T.CallOfDuty.Tokens) {
        if (!tokens.xsrf || !tokens.atkn || !tokens.sso) {
            throw new Error('Missing tokens for Call of Duty API')
        }
        this.tokens = tokens
    }
    private async request(config:Partial<AxiosRequestConfig>):Promise<any> {
        const { data:res, status } = await axios({
            method: 'GET',
            baseURL: 'https://my.callofduty.com/api/papi-client',
            headers: {
                'Cache-Control': 'no-cache',
                Cookie: `ACT_SSO_COOKIE=${this.tokens.sso}; ACT_SSO_COOKIE_EXPIRY=1591153892430; atkn=${this.tokens.atkn}; API_CSRF_TOKEN=${this.tokens.xsrf}`
            }, ...config,
        })
        if (status !== 200 || res.status !== 'success') {
            console.log('[!] API Error:', res.data.message.replace('Not permitted: ', ''))
            throw res.data.error
        }
        return res.data
    }
    async Identity() {
        return this.request({ url: `/crm/cod/v2/identities` })
    }
    async Friends() {
        return this.request({ url: `/codfriends/v1/compendium` })
    }
    async Platforms(username:string, platform:T.CallOfDuty.Platform='uno') {
        return this.request({ url: `/crm/cod/v2/accounts/platform/${platform}/gamer/${encodeURIComponent(username)}` })
    }
    async Profile(username:string, platform:T.CallOfDuty.Platform='uno', mode:T.CallOfDuty.Mode='wz', game:T.CallOfDuty.Game='mw'):Promise<T.CallOfDuty.Res.Warzone.Profile> {
        return this.request({ url: `/stats/cod/v1/title/${game}/platform/${platform}/gamer/${encodeURIComponent(username)}/profile/type/${mode}` })
    }
    async Matches(username:string, platform:T.CallOfDuty.Platform='uno', mode:T.CallOfDuty.Mode='wz', game:T.CallOfDuty.Game='mw', next:number=0):Promise<T.CallOfDuty.Res.Warzone.Matches> {
        return this.request({ url: `/crm/cod/v2/title/${game}/platform/${platform}/gamer/${encodeURIComponent(username)}/matches/${mode}/start/0/end/${next}/details` })
    }
    async Login(email:string, password:string) {
        const response = await axios.get('https://profile.callofduty.com/login')
        const xsrf = response?.headers['set-cookie'].find((cookie:string) => cookie.includes('XSRF-TOKEN='))?.replace(/^XSRF-TOKEN=([^;]+);.*$/, '$1')
        const fetch = (cfg:any):Promise<any> => new Promise((resolve,reject) => deprecatedRequest(cfg, (err:any,res:any) => err ? reject(err) : resolve(res)))
        if (!xsrf) {
            throw 'missing xsrf token'
        }
        // No response cookies with Axios so fugg it for now
        const { headers } = await fetch({
            method: 'POST',
            url: 'https://profile.callofduty.com/do_login?new_SiteId=cod',
            headers: {
                'Cookie': `XSRF-TOKEN=${xsrf}; new_SiteId=cod;`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                username:email,
                password,
                remember_me: 'true',
                _csrf: xsrf
            }
        })
        if (headers.location.toLowerCase().includes('captcha')) {
            throw 'captcha required'
        }
        try {
            const atkn = headers['set-cookie'].find((cookie:string) => cookie.includes('atkn='))?.replace(/^atkn=([^;]+);.*$/, '$1')
            const sso = headers['set-cookie'].find((cookie:string) => cookie.includes('ACT_SSO_COOKIE='))?.replace(/^ACT_SSO_COOKIE=([^;]+);.*$/, '$1')
            return { xsrf, atkn, sso }
        } catch(e) {
            throw 'invalid credentials'
        }
    }
}

export namespace T {
    export namespace CallOfDuty {
        export type Mode = 'mp' | 'wz'
        export type Game = 'mw' | 'bo4' | 'wwii'
        export type Platform = 'uno' | 'battle' | 'psn' | 'xbl'
        export interface Tokens {
            sso: string
            xsrf: string
            atkn: string
        }
        export namespace Res {
            export interface Loadout {
                primaryWeapon: Loadout.Weapon
                secondaryWeapon: Loadout.Weapon
                perks: { name: string }[]
                extraPerks: { name: string }[]
                killstreaks: { name: string }[]
                tactical: { name: string }
                lethal: { name: string }
            }
            export namespace Loadout {
                export interface Weapon {
                    name: string
                    label: string
                    imageLoot: string
                    imageIcon: string
                    variant: string
                    attachments: Weapon.Attachment[]
                }
                export namespace Weapon {
                    export interface Attachment {
                        name: string
                        label: string
                        image: string
                    }
                }
            }
            export namespace Warzone {
                export interface Matches {
                    summary: any
                    matches: Match[]
                }
                export interface Match {
                    utcStartSeconds: number
                    utcEndSeconds: number
                    map: string
                    mode: string
                    matchID: string
                    draw: boolean
                    privateMatch: boolean
                    duration: number
                    playlistName: string
                    version: number
                    gameType: string
                    playerCount: number
                    teamCount: number
                    player: Match.Player
                    playerStats: Match.PlayerStats
                    rankedTeams: Match.Team[]
                }
                export namespace Match {
                    export interface Player {
                        team: string
                        rank: number
                        awards: {}
                        username: string
                        clantag: string
                        uno: string
                        loadout: Loadout[]
                    }
                    export interface Team {
                        name: string
                        placement: number
                        time: number
                        plunder: null
                        players: Match.Team.Player[]
                    }
                    export namespace Team {
                        export interface Player {
                            uno: string
                            username: string
                            clantag: string
                            platform: string
                            team: string
                            rank: number
                            result: null
                            playerStats: Player.Stats
                            loadouts: Loadout[]
                        }
                        export namespace Player {
                            export interface Stats {
                                rank: number
                                score: number
                                kills: number
                                deaths: number
                                kdRatio: number
                                damageDone: number
                                damageTaken: number
                                timePlayed: number
                                wallBangs: number
                                headshots: number
                                executions: number
                                assists: number
                                nearmisses: number
                                longestStreak: number
                                scorePerMinute: number
                                distanceTraveled: number
                                percentTimeMoving: number
                            }
                        }
                    }
                    export interface PlayerStats {
                        rank: number
                        kills: number
                        deaths: number
                        kdRatio: number
                        headshots: number
                        assists: number
                        executions: number
                        wallBangs?: number
                        nearmisses?: number
                        damageDone: number
                        damageTaken: number
                        longestStreak: number
                        scorePerMinute: number
                        percentTimeMoving: number
                        distanceTraveled: number
                        timePlayed: number
                        score: number
                        miscXp: number
                        medalXp: number
                        matchXp: number
                        scoreXp: number
                        bonusXp: number
                        totalXp: number
                        challengeXp: number
                        teamPlacement: number
                        teamSurvivalTime: number
                        gulagKills?: number
                        gulagDeaths?: number
                        objectiveReviver?: number
                        objectiveTeamWiped?: number
                        objectiveBrKioskBuy?: number
                        objectiveBrCacheOpen?: number
                        objectiveLastStandKill?: number
                        objectiveTrophyDefense?: number
                        objectiveDestroyedEquipment?: number
                        objectiveBrDownEnemyCircle1?: number
                        objectiveBrDownEnemyCircle2?: number
                        objectiveBrDownEnemyCircle3?: number
                        objectiveBrDownEnemyCircle4?: number
                        objectiveBrDownEnemyCircle5?: number
                        objectiveBrDownEnemyCircle6?: number
                        objectiveBrDownEnemyCircle7?: number
                        objectiveBrDownEnemyCircle8?: number
                        objectiveBrMissionPickupTablet?: number
                        objectiveMunitionsBoxTeammateUsed?: number
                        objectiveManualFlareMissileRedirect?: number
                        objectiveMedalScoreKillSsRadarDrone?: number
                        objectiveMedalScoreSsKillTomaStrike?: number
                    }
                }
                // Warzone Profile
                export interface Profile {
                    level: number
                }
            }
            export namespace Multiplayer {
                export namespace Match {
                    export interface Player extends Warzone.Match.Player {
                        nemesis: string
                        mostKilled: string
                        killstreakUsage: {
                            pac_sentry: number          // Wheelson
                            hover_jet: number           // VTOL
                            chopper_gunner: number      // Chopper Gunner
                        }
                    }
                }
            }
        }
    }
}
