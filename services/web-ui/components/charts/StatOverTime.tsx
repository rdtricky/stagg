import Line from './base/Line'

export default ({ username, performanceMap, colors=[], stat, xStep=0, yStep=0, color='' }) => {
    const lines = []
    for(const uname in performanceMap) {
        console.log(`${uname} has ${performanceMap[uname].length} matches`)
        lines.push({
            color: colors[lines.length],
            label: uname.split('#')[0],
            data: performanceMap[uname].map(p => {
                if (typeof stat === typeof 'str') return p.stats[stat]
                let quotient = p.stats[stat.divisor]/p.stats[stat.dividend]
                if (isNaN(quotient)) {
                    // console.log(p.stats[stat.divisor], '/', p.stats[stat.dividend], '=', quotient, 'is invalid, setting to dividend', p.stats[stat.dividend])
                    quotient = p.stats[stat.dividend]
                }
                if (quotient === Infinity) {
                    // console.log(p.stats[stat.divisor], '/', p.stats[stat.dividend], '=', quotient, 'is invalid, setting to divisor', p.stats[stat.divisor])
                    quotient = p.stats[stat.divisor]
                }
                return quotient
            })
        })
    }
    return <Line lines={lines} xStep={xStep} yStep={yStep} labelType="none" />
}