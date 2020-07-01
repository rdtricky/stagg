import Line from './base/Line'

export default ({ username, performances, stat, xStep=0, yStep=0, color='' }) => {
    const finishPosStats = []
    for(const p of performances) {
        const key = p.stats.teamPlacement - 1
        if (!finishPosStats[key]) finishPosStats[key] = { games: 0, stats: {} }
        finishPosStats[key].games++
        for(const statKey in p.stats) {
          if (statKey === 'xp') continue // skip xp for now (its nested)
            if (!finishPosStats[key].stats[statKey]) finishPosStats[key].stats[statKey] = 0
            finishPosStats[key].stats[statKey] += statKey === 'downs' ? p.stats.downs.reduce((a,b) => a+b, 0) : p.stats[statKey]
        }
    }
    const lines = [{ label: username.split('#')[0], data: finishPosStats.map(f => f.stats[stat] / f.games), color }]
    return <Line xStep={xStep} yStep={yStep} lines={lines} />
}