import Card from '../Card'
import Line from './base/Line'
import { ProviderProps } from '../Provider'
import { divisorStat } from '../../services/stagg'

export default ({ data: { matches, performances } }:ProviderProps) => {
    console.log('Rendering DPK')
    let totalMatches = 0
    let totalPerformers = 0
    let totalPerformances = 0
    if (matches) totalMatches = Object.keys(matches).length
    if (performances) {
        totalPerformers = Object.keys(performances).length
        for(const performer of Object.values(performances)) totalPerformances += Object.keys(performer).length
    }
    console.log(`Main got prop lengths { matches: ${totalMatches}, performers: ${totalPerformers}, performances: ${totalPerformances}}`)
    const { players, enemies } = divisorStat(matches, performances, 'damageDone', 'kills')
    console.log({ players, enemies })
    // const username = key.split(':')[key.split(':').length-1].split('#')[0]
    return (
        <Card label="Damage Per Kill" large expandable>
            <Line />
        </Card>
    )
}
