import { CallOfDuty } from '@stagg/util'
import Pie from './base/Pie'

export default ({ performances }) => {
    const groups = {}
    for(const p of performances) {
        console.log('mode for', p.modeId)
        const mode = CallOfDuty.Warzone.modeMap[p.modeId]
        if (!mode) console.log('do not have', p.modeId)
        const teamSizeLabels = ['Solos', 'Duos', 'Trios', 'Quads']
        if (!groups[teamSizeLabels[mode.teamSize-1]]) groups[teamSizeLabels[mode.teamSize-1]] = 0
        groups[teamSizeLabels[mode.teamSize-1]]++
    }
    return <Pie groups={groups} />
}