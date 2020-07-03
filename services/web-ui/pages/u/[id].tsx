import Head from 'next/head'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { commaNum } from '@stagg/util'
import Card from '../../components/Card'
import Center from '../../components/Center'
import Template, { FixedOverlay } from '../../components/Template'
import GamesByMode from '../../components/charts/GamesByMode'
import DownsByCircle from '../../components/charts/DownsByCircle'
import TopFinishesByMode from '../../components/charts/TopFinishesByMode'
import StatByRank from '../../components/charts/StatByRank'
import StatOverTime from '../../components/charts/StatOverTime'
import WinsByMode from '../../components/charts/WinsByMode'
import cfg from '../../config'

const inferUsername = (id:string) => {
    const [name, slug] = id.split('@')
    return !slug ? name : `${name}#${slug}`
}

export interface Filters {
    timeline?:number
    stats?: {
        [key:string]: {
            min?: number
            max?: number
        }
    }
}
const FilterContainer = styled.div`
    margin: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    width: 100%;
    max-width: 1230px;
    padding: 0.5rem;
    border-radius: 0.25rem;
    text-align: right;

    label {
        font-size: 1.25rem;
        display: block;
        float: left;
        padding: 0 0.5rem;
    }

    .comparison-profile {
        display: inline-block;
        margin-right: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(0, 0, 0, 0.5);
        font-size: 0.85rem;
        padding: 0.25rem 0.5rem;
        position: relative;
        bottom: -3px;

        .color {
            padding: 0.25rem;
            margin-left: -0.5rem;
            margin-right: 0.5rem;
        }
        .close {
            color: red;
            font-weight: 700;
            background: rgba(0, 0, 0, 0.5);
            padding: 0.25rem;
            margin-right: -0.5rem;
            margin-left: 0.5rem;
            cursor: pointer;
        }
    }

    .input-container {
        position: relative;
        z-index: 1;
        display: inline-block;
        width: 12rem;
        max-width: 33%;
        .results {
            text-align: left;
            display: block;
            width: 100%;
            background: rgba(0, 0, 0, 0.75);
            border: 1px solid rgba(0, 0, 0, 0.95);
            position: absolute;
            top: 1.5rem;
            div {
                cursor: pointer;
                padding: 0.25rem 0.5rem;
            }
        }
        input[type="text"] {
            width: 100%;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(0, 0, 0, 0.5);
            outline: none;
            box-shadow: none;
            padding: 0.3rem 0.5rem 0.2rem;
            color: rgba(255, 255, 255, 0.75);
        }
    }

`

const Page = ({ user, count }) => {
    const router = useRouter()
    const username = inferUsername(router.query.id as string)
    const [performanceMap, setPerformanceMap] = useState({ [username]: [] })
    const isMe = user?.profiles?.uno === username
    const filters:Filters = { timeline: 100, stats: { teamPlacement: { max: 20 } } }
    const [comparisonSearchInput, setComparisonSearchInput] = useState('')
    const [comparisonSearchResults, setComparisonSearchResults] = useState([])
    const downloadProfile = async (username:string) => {
      const download = await fetch(`${cfg.api.host}/download?platform=uno&username=${encodeURIComponent(username)}`)
      const performances = await download.json()
      setPerformanceMap({...performanceMap, [username]: performances })
    }
    const updateComparisonSearch = async (input:string) => {
        setComparisonSearchInput(input)
        if (input.length > 1) {
            const search = await fetch(`${cfg.api.host}/search`, {
                method: 'POST',
                body: JSON.stringify({ username: input, platform: 'uno' })
            })
            const playerProfiles = await search.json()
            setComparisonSearchResults(playerProfiles.map(p => p.uno))
        }
    }
    const addProfileForComparison = async (username:string) => {
        setComparisonSearchInput('')
        await downloadProfile(username)
    }
    const removeProfileComparison = (username:string) => {
        const updatedPerformanceMap = { ...performanceMap }
        delete updatedPerformanceMap[username]
        setPerformanceMap(updatedPerformanceMap)
    }
    useEffect(() => { downloadProfile(username) }, [])
  
    const filteredPerformanceMap = { ...performanceMap }
    for(const username in filteredPerformanceMap) {
      filteredPerformanceMap[username] = filteredPerformanceMap[username].sort((a,b) => a.startTime - b.startTime).filter((p) => {
          if (!p.stats.teamPlacement) return false
          for(const stat in p.stats) {
              if (filters.stats[stat]) {
                  if (filters.stats[stat].min && p.stats[stat] < filters.stats[stat].min) return false
                  if (filters.stats[stat].max && p.stats[stat] > filters.stats[stat].max) return false
              }
          }
          return true
        })
    }

    const colors = [
        'rgba(0, 255, 0, 0.5)',
        'rgba(255, 255, 0, 0.5)',
        'rgba(255, 0, 0, 0.5)',
        'rgba(255, 0, 255, 0.5)',
        'rgba(0, 255, 255, 0.5)',
        'rgba(0, 0, 255, 0.5)',
    ]

  return (
    <Template user={user}>
        {
            !filteredPerformanceMap[username].length ? <FixedOverlay><Center><h1>Loading { commaNum(count.performances) } matches...</h1></Center></FixedOverlay> : <></>
        }
        <Head>
            <title>{ isMe ? '(ME) ' : '' }{ username } : { commaNum(count.performances) } Matches | Call of Duty Warzone</title>
        </Head>
        <Center>
            <FilterContainer>
                <label>{username}</label>
                {
                    Object.keys(performanceMap).filter(uname => uname !== username)
                        .map(uname => (
                            <span key={uname} className="comparison-profile">
                                <span className="color" style={{background: colors[Object.keys(performanceMap).indexOf(uname)]}}></span>
                                <span>{uname}</span>
                                <span className="close" onClick={() => removeProfileComparison(uname)}>X</span>
                            </span>
                        ))
                }
                <div className="input-container">
                    <input type="text" 
                        placeholder="Search players to compare..." 
                        value={comparisonSearchInput} 
                        onChange={e => updateComparisonSearch(e.target.value)} />
                    <div className="results" style={{display: comparisonSearchInput.length >=2 && comparisonSearchResults.length ? 'block' : 'none'}}>
                        {
                            comparisonSearchResults.map(uname => <div key={uname} onClick={() => addProfileForComparison(uname)}>{uname}</div>)
                        }
                    </div>
                </div>
                <i className="icon-search" style={{marginLeft: '0.5rem', color: 'rgba(255, 255, 255, 0.75)'}} />
            </FilterContainer>
            <Card label="Games by Mode">
                <GamesByMode performances={filteredPerformanceMap[username]} />
            </Card>
            <Card label="Wins by Mode">
                <WinsByMode performances={filteredPerformanceMap[username]} />
            </Card>
            <Card label="Top finishes by Mode">
                <TopFinishesByMode performances={filteredPerformanceMap[username]} />
            </Card>
            <Card label="Downs by Circle">
                <DownsByCircle performances={filteredPerformanceMap[username]} />
            </Card>
            <Card label="Kills by Rank" large expandable>
                <StatByRank
                    yStep={1}
                    colors={colors}
                    username={username}
                    performanceMap={filteredPerformanceMap}
                    stat="kills" />
            </Card>
            <Card label="Damage by Rank" large expandable>
                <StatByRank
                    yStep={200}
                    colors={colors}
                    username={username}
                    performanceMap={filteredPerformanceMap}
                    stat="damageDone" />
            </Card>
            <Card label="Damage per Kill over time" large expanded>
                <StatOverTime
                    yStep={100}
                    colors={colors}
                    username={username}
                    performanceMap={filteredPerformanceMap}
                    stat={{ divisor: 'damageDone', dividend: 'kills' }} />
            </Card>
        </Center>
    </Template>
  )
}

Page.getInitialProps = async ({ query }) => {
    const username = inferUsername(query.id)
    const ping = await fetch(`${cfg.api.host}/ping`, {
        method: 'POST',
        body: JSON.stringify({ username, platform: 'uno' })
    })
    const { performances } = await ping.json()
    return { count: { performances } }
}

export default Page
