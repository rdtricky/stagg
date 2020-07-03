import { CallOfDuty } from '@stagg/util'
import Pie from './base/Pie'

export default ({ performances }) => {
    const groups = {}
    for(const p of performances) {
        const mode = CallOfDuty.Warzone.modeMap[p.modeId]
        if (!mode) {
            console.log(`No mode for "${p.modeId}" in`, CallOfDuty.Warzone.modeMap)
            continue
        }
        const teamSizeLabels = ['Solos', 'Duos', 'Trios', 'Quads']
        if (!groups[teamSizeLabels[mode.teamSize-1]]) groups[teamSizeLabels[mode.teamSize-1]] = 0
        if (p.stats.teamPlacement === 1) groups[teamSizeLabels[mode.teamSize-1]]++
    }
    return <Pie groups={groups} />
}