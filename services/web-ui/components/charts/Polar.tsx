import { Polar } from 'react-chartjs-2'

const options = { maintainAspectRatio: false, legend: { display: false }, tooltips: { enabled: true } }
export default ({ groups }) => {
  const data = {
    labels: Object.keys(groups),
    datasets: [{
      label: '',
      data: Object.values(groups),
      backgroundColor: [
				'#003f5c',
				'#2f4b7c',
				'#665191',
				'#a05195',
				'#d45087',
				'#f95d6a',
				'#ff7c43',
				'#ffa600',
			]
    }]
  }
  return <Polar options={options} data={data} />
}