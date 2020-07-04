import { useState } from 'react'
import Card from '../../components/Card'
import Dropdown from '../../components/Dropdown'
import StatByRank from '../../components/charts/StatByRank'
export default ({ colors, username, performanceMap }) => {
    const statMap = [
        { stat: 'kills', label: 'Kills' },
        { stat: 'deaths', label: 'Deaths' },
        { stat: 'damageDone', label: 'DMG Done' },
        { stat: 'damageTaken', label: 'DMG Taken' },
    ]
    const dropdownItemClicked = (statMapItem) => {
        setStat(statMapItem.stat)
        setActiveItem({ label: statMapItem.label, onClick: () => dropdownItemClicked(statMapItem)})
    }
    const dropdownItems = statMap.map(s => ({ label: s.label, onClick:() => dropdownItemClicked(s) }))
    const [stat, setStat] = useState(statMap[0])
    const [activeItem, setActiveItem] = useState(dropdownItems[0])
    const Label = (
        <span>
            <span style={{fontSize: '0.9rem', display: 'inline-block', position: 'relative', top: '-5px', marginRight: '0.5rem'}}>
                <Dropdown width="7rem" activeItem={activeItem} items={dropdownItems} />
            </span>
            by Finish
        </span>
    )
    return (
        <Card label={Label} large expandable>
            <StatByRank
                yStep={1}
                colors={colors}
                username={username}
                performanceMap={performanceMap}
                stat={stat} />
        </Card>
    )
}