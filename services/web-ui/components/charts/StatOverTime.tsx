import Line from './base/Line'

export default ({ username, performances, stat, xStep=0, yStep=0, color='' }) => {
    const lines = [{
        color,
        label: username.split('#')[0],
        data: performances.map(p => {
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
    }]
    return <Line lines={lines} xStep={xStep} yStep={yStep} labelType="none" />
}