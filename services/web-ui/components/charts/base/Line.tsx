import { Line } from 'react-chartjs-2'
import styled from 'styled-components'

const Container = styled.div`

`
const colors = [
  '#ffa600',
  '#f95d6a',
  '#d45087',
  '#665191',
  '#a05195',
  '#f95d6a',
  '#ff7c43',
  '#003f5c',
  '#2f4b7c',
]
const data = {
    labels: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'],
    datasets: [
      {
        label: 'MellowD',
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: colors[0],
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors[0],
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        label: 'SirSicksALot',
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors[1],
        borderColor: colors[1],
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: colors[1],
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors[1],
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [32, 43, 74, 65, 45, 23, 75]
      },
      {
        label: '[E] MellowD',
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors[2],
        borderColor: colors[2],
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: colors[2],
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors[2],
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [19, 34, 62, 46, 25, 75, 34]
      },
      {
        label: '[E] SirSicksALot',
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors[3],
        borderColor: colors[3],
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: colors[3],
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors[3],
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [53, 42, 13, 54, 12, 42, 64]
      }
    ]
  }

interface Props {
  expanded?:boolean
}
export default ({expanded=false}:Props) => {
  const options = {
    legend: {
      display: false,
      labels: {
          fontColor: "white",
          fontSize: 18
      }
    },
    scales: {
        yAxes: [{
            ticks: {
                fontColor: "white",
                fontSize: 18,
                stepSize: 10,
                beginAtZero: true
            }
        }],
        xAxes: [{
            ticks: {
                fontColor: "white",
                fontSize: 14,
                stepSize: 1,
                beginAtZero: true
            }
        }]
    }
  }
  options.legend.display = expanded
  console.log("Expanded:", options.legend.display)
  return <Line options={options} data={data} />
}