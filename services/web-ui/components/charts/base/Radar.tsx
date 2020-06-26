import { Radar } from 'react-chartjs-2'
import styled from 'styled-components'

const Container = styled.div`

`
const options = { maintainAspectRatio: false, legend: { display: false }, tooltips: { enabled: true } }
const data = {
    labels: ['Quads', 'Trios', 'Duos', 'Solos'],
    datasets: [
      {
        label: 'MellowD',
        backgroundColor: 'rgba(179,181,198,0.2)',
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)',
        data: [3, 5, 7, 9]
      },
      {
        label: 'SirSicksALot',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        pointBackgroundColor: 'rgba(255,99,132,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255,99,132,1)',
        data: [2, 3, 3, 1]
      }
    ]
  }

  export default () => <Radar options={options} data={data} />