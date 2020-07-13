import { CallOfDuty } from './callofduty'
export { CallOfDuty }

export namespace Map {
    export namespace CallOfDuty {
        export const Platforms = {
            uno:    { label: 'ATV', name: 'Activision'          },
            xbl:    { label: 'XBL', name: 'Xbox Live'           },
            psn:    { label: 'PSN', name: 'PlayStation Network' },
            steam:  { label: 'STM', name: 'Steam'               },
            battle: { label: 'BTL', name: 'Battle.net'          },
        }
        export const Modes = {
            br_87:                  { type: 'br', teamSize: 1 },
            br_71:                  { type: 'br', teamSize: 1 },
            br_brsolo:              { type: 'br', teamSize: 1 },
            br_88:                  { type: 'br', teamSize: 2 },
            br_brduos:              { type: 'br', teamSize: 2 },
            br_74:                  { type: 'br', teamSize: 3 },
            br_77:                  { type: 'br', teamSize: 3 },
            br_25:                  { type: 'br', teamSize: 3 },
            br_brtrios:             { type: 'br', teamSize: 3 },
            br_jugg_brtriojugr:     { type: 'br', teamSize: 3 }, // juggernaut drops in trios
            br_brtriostim_name2:    { type: 'br', teamSize: 3 }, // stimulus trios (auto respawn if >$4500)
            br_89:                  { type: 'br', teamSize: 4 },
            br_brquads:             { type: 'br', teamSize: 4 },
            br_86:                  { type: 'br', teamSize: 4, realism: true },
            br_br_real:             { type: 'br', teamSize: 4, realism: true }, // realism quads
            br_brthquad:            { type: 'br', teamSize: 4, lobbySize: 200 }, // 200 player quads
            brtdm_rmbl:             { type: 'tdm', teamSize: 6, lobbySize: 150 },
            br_dmz_38:              { type: 'plunder', teamSize: 3 },
            br_dmz_76:              { type: 'plunder', teamSize: 4 },
            br_dmz_85:              { type: 'plunder', teamSize: 4 },
            br_dmz_104:             { type: 'plunder', teamSize: 4 },
        }
        /*
        Circle 1 outlined, 3:30 till gas moves in (-1:00). Gas moves to circle 1 in 4:30.
        Circle 2 outlined, 1:30 till gas moves in. Gas moves to circle 2 in 3:30. (+1:00)
        Circle 3 outlined, 1:15 till gas moves in. Gas moves to circle 3 in 2:50 (+:50)
        Circle 4 outlined, 1:00 till gas moves in. Gas moves to circle 4 in 1:50 (+:20)
        Circle 5 outlined, 1:00 till gas moves in. Gas moves to circle 5 in 1:08 (+:08)
        Circle 6 outlined, :50 till gas moves in. Gas moves to circle 6 in :50 (+:05)
        Circle 7 outlined, :30 till gas moves in. Gas moves to circle 7 in :48 (+:03)
        1:45 for last circle to close (+:15)
        */
    }
}
export namespace Schema {
    export namespace CallOfDuty {
        export type Mode = 'mp' | 'wz'
        export type Game = 'mw' | 'bo4' | 'wwii'
        export type Platform = 'uno' | 'battle' | 'psn' | 'xbl' | 'steam'
        export interface Tokens {
            sso: string
            xsrf: string
            atkn: string
        }
        export namespace Res {
            export interface Identity {
                titleIdentities: {
                    title: string // game name eg: bo4 / mw
                    platform: Platform
                    username: string
                    activeDate: number
                    activityType: 'wz'
                }[]
            }
            export interface Platforms {
                [key:string]: { // key is platform
                    username: string
                }
            }
            export interface Friends {
                uno: Friend[]
                incomingInvitations: Friend[]
                outgoingInvitations: Friend[]
                blocked: Friend[]
                firstParty: {
                    xbl: {
                        username: string
                        platform: Platform
                        avatarUrlLarge: string
                        avatarUrlLargeSsl: string
                        status: {
                            online: boolean
                        }
                        identities?: {
                            uno: {
                                username: string
                                platform: Platform
                                accountId: string
                            }
                        }
                    }[]
                }
            }
            export interface Friend {
                username: string
                platform: Platform
                accountId: string
                status: {
                    online: boolean
                    curentTitleId?: 'mw' | 'bo4' // only in the "friends" and "firstParty" it seems
                }
            }
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
                    summary: Summary
                    matches: Match[]
                }
                export interface Summary {
                    
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
                export interface Matches {

                }
                export interface Summary {

                }
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