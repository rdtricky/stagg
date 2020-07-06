import { Map } from '@stagg/api'
import Radar from './base/Radar'

export default ({ performances }) => {
    const emptyGroup = [0, 0, 0, 0]
    const groups = {
        Top2: [...emptyGroup],
        Top3: [...emptyGroup],
        Top5: [...emptyGroup],
        Top10: [...emptyGroup],
    }
    for(const p of performances) {
        const mode = Map.CallOfDuty.Modes[p.modeId]
        if (!mode) continue
        const teamSizeLabels = ['Solos', 'Duos', 'Trios', 'Quads']        
        if (p.stats.teamPlacement > 0 && p.stats.teamPlacement <= 10) groups.Top10[mode.teamSize-1]++
        if (p.stats.teamPlacement > 0 && p.stats.teamPlacement <= 5) groups.Top5[mode.teamSize-1]++
        if (p.stats.teamPlacement > 0 && p.stats.teamPlacement <= 3) groups.Top3[mode.teamSize-1]++
        if (p.stats.teamPlacement > 0 && p.stats.teamPlacement <= 2) groups.Top2[mode.teamSize-1]++
    }
    return <Radar groups={groups} />
}