import { Map } from '@stagg/api'
import Pie from './base/Pie'

export default ({ performances }) => {
    const groups = {}
    for(const p of performances) {
        const mode = Map.CallOfDuty.Modes[p.modeId]
        if (!mode) {
            console.log(`No mode for "${p.modeId}" in`, Map.CallOfDuty.Modes)
            continue
        }
        const teamSizeLabels = ['Solos', 'Duos', 'Trios', 'Quads']
        if (!groups[teamSizeLabels[mode.teamSize-1]]) groups[teamSizeLabels[mode.teamSize-1]] = 0
        groups[teamSizeLabels[mode.teamSize-1]]++
    }
    return <Pie groups={groups} />
}