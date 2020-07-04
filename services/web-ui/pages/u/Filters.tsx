import Link from 'next/link'
import Cookies from 'js-cookie'
import styled from 'styled-components'
import { useRef, useState, useEffect } from 'react'
import cfg from '../../config'
import { colors } from './[id]'
import { useOnClickOutside } from '../../hooks'

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

.filter-container {
    display: inline-block;
    max-width: 60%;
    font-size: 0.85rem;
    position: relative;
    z-index: 1;

    span {
        display: inline-block;
        position: relative;
        i {
            cursor: pointer;
            position: relative;
            bottom: 0;
            margin-left: 0.5rem;
            display: inline-block;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid transparent;
            border-right: none;
            padding: 0.35rem 0.5rem 0.4rem;
        }

        input {
            position: relative;
            top: -1px;
            outline: none;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(0, 0, 0, 0.5);
            width: 4rem;
            text-align: left;
            color: rgba(255, 255, 255, 0.75);
            padding: 5px 0.5rem 5px;
            border-left: none;
        }

        ul {
            text-align: left;
            position: absolute;
            cursor: pointer;
            display: inline-block;
            list-style: none;
            margin: 0;
            padding: 0;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(0, 0, 0, 0.5);
            li {
                display: none;
                padding: 0.2rem 0.5rem 0.25rem;
                background: rgba(0, 0, 0, 0.75);
            }
            li:first-of-type {
                display: block;
                background: none;
            }
        }

        ul.open {
            li {
                display: block;
                :hover {
                    background: rgba(0, 0, 0, 1);
                }
            }
        }
    }
}
.comparison-container {
    display: inline-block;
    max-width: 30%;
    overflow: auto;
    overflow-y: hidden;
    margin: -10px 0.5rem -10px;
    position: relative;
    top: -2px;
    ::-webkit-scrollbar-track {
        height: 6px;
        -webkit-box-shadow: inset 0 0 1px rgba(0,0,0,0.3);
        background-color: rgba(0, 0, 0, 0.25);
    }
    ::-webkit-scrollbar {
        height: 6px;
        background-color: none;
    }
    ::-webkit-scrollbar-thumb {
        height: 6px;
        background-color: rgba(0, 0, 0, 0.75);
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



// allow sort by time, kills, finish, etc
const filterableStats = [
]


export interface Filters {
    timeline?:number
    stats?: {
        [key:string]: {
            min?: number
            max?: number
        }
    }
}

const filterMap = [
    { stat: 'teamPlacement',    label: 'Finish' },
    { stat: 'kills',            label: 'Kills' },
    { stat: 'Deaths',           label: 'Deaths' },
    { stat: 'damageDone',       label: 'DMG Done' },
    { stat: 'damageTaken',      label: 'DMG Taken' },
]
const sortMap = [
    { prop: 'startTime',        label: 'Date' },
    { stat: 'teamPlacement',    label: 'Finish' },
    { stat: 'kills',            label: 'Kills' },
    { stat: 'Deaths',           label: 'Deaths' },
    { stat: 'damageDone',       label: 'DMG Done' },
    { stat: 'damageTaken',      label: 'DMG Taken' },
]

export default ({ username, performanceMap, setPerformanceMap, filters, setFilters }) => {
    const sortRef = useRef()
    const filterRef = useRef()
    useOnClickOutside(sortRef, () => setSortOpen(false))
    useOnClickOutside(filterRef, () => setFiltersOpen(false))
    const [sortOpen, setSortOpen] = useState(false)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [comparisonSearchInput, setComparisonSearchInput] = useState('')
    const [comparisonSearchResults, setComparisonSearchResults] = useState([])
    const [activeFilterKey, setActiveFilterKey] = useState(filterMap[0])
    const [activeSortKey, setActiveSortKey] = useState(sortMap[0])
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
    const onFilterInputChange = (stat:string, type:'min'|'max', value:number) => {
        const updatedFilters = {
            ...filters,
            stats: {
                ...filters.stats,
                [stat]: { ...filters.stats[stat], [type]: value }
            }
        }
        Cookies.set('wz.filters', JSON.stringify(updatedFilters), { expires: 365 })
        setFilters(updatedFilters)
    }
    const onLimitInputChange = (limit:number) => {
        const updatedFilters = {
            ...filters,
            timeline: limit,
        }
        Cookies.set('wz.filters', JSON.stringify(updatedFilters), { expires: 365 })
        setFilters(updatedFilters)
    }
    return (
        <FilterContainer>
            <label>{username}</label>

            <div className="filter-container">
                <span>
                    <i onClick={() => setFiltersOpen(!filtersOpen)} className="icon-filter" title="filter matches by criteria" />
                    <ul ref={filterRef} onClick={() => setFiltersOpen(!filtersOpen)} className={filtersOpen ? 'open' : ''} style={{width: '8rem'}}>
                        <li onClick={() => setActiveFilterKey(activeFilterKey)}>{activeFilterKey.label}</li>
                        {
                            filterMap.map(f => (
                                activeFilterKey.stat === f.stat ? null : <li key={f.stat} onClick={() => setActiveFilterKey(f)}>{f.label}</li>
                            ))
                        }
                    </ul>
                    <span style={{display: 'inline-block', width: '8rem'}}></span>
                    <input type="number" style={{width: '4rem'}}
                        onChange={e => onFilterInputChange(activeFilterKey.stat, 'min', Number(e.target.value))}
                        value={filters.stats[activeFilterKey.stat]?.min || ''}
                        placeholder="Min" min={0} />
                    <input type="number" style={{width: '4rem'}}
                        onChange={e => onFilterInputChange(activeFilterKey.stat, 'max', Number(e.target.value))}
                        value={filters.stats[activeFilterKey.stat]?.max || ''}
                        placeholder="Max" min={0} />
                </span>
                <span>
                    <i onClick={() => setSortOpen(!sortOpen)} className="icon-sort-alpha-asc" title="sort results by criteria" />
                    <ul ref={sortRef} onClick={() => setSortOpen(!sortOpen)} className={sortOpen ? 'open' : ''} style={{width: '8rem'}}>
                        <li onClick={() => setActiveFilterKey(activeFilterKey)}>{activeFilterKey.label}</li>
                        {
                            filterMap.map(f => (
                                activeFilterKey.stat === f.stat ? null : <li key={f.stat} onClick={() => setActiveFilterKey(f)}>{f.label}</li>
                            ))
                        }
                    </ul>
                    <span style={{display: 'inline-block', width: '8rem'}}></span>
                </span>
                <span>
                    <i className="icon-pagebreak" title="# of matches to keep after sorting" />
                    <input type="number" style={{width: '4rem'}}
                        onChange={e => onLimitInputChange(Number(e.target.value))}
                        value={filters.timeline}
                        placeholder="Min" min={5} />
                </span>
                {/* <span style={{width: '15rem'}}>
                    <i onClick={() => setFiltersOpen(!filtersOpen)} className="icon-filter" title="filter matches by criteria" />
                    <ul onClick={() => setFiltersOpen(!filtersOpen)} className={filtersOpen ? 'open' : ''}>
                        <li>Kills</li>
                        <li>Deaths</li>
                    </ul>
                    <input type="number" style={{marginLeft: '2rem', width: '4rem'}} placeholder="Min" />
                    <input type="number" style={{width: '4rem'}} placeholder="Max" />
                </span>
                <span style={{width: '4rem'}}>
                    <i onClick={() => setSortOpen(!sortOpen)} className="icon-sort-alpha-asc" title="filter matches by criteria" />
                    <ul onClick={() => setSortOpen(!sortOpen)} className={sortOpen ? 'open' : ''} style={{width: }}>
                        <li>Kills</li>
                        <li>Deaths</li>
                    </ul>
                </span>
                <span style={{width: '9rem'}}>
                    <i className="icon-pagebreak" title="# of matches to include" />
                    <input type="number" style={{width: '4rem'}} />
                </span> */}
            </div>
            <div className="comparison-container">
            {
                Object.keys(performanceMap).filter(uname => uname !== username)
                    .map(uname => (
                        <span key={uname} className="comparison-profile">
                            <span className="color" style={{background: colors[Object.keys(performanceMap).indexOf(uname)]}}></span>
                            <span><Link href="/u/[id]" as={`/u/${uname.split('#').join('@')}`}><a>{uname}</a></Link></span>
                            <span className="close" onClick={() => removeProfileComparison(uname)}>X</span>
                        </span>
                    ))
            }
            </div>
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
    )
}
