import { Pie } from 'react-chartjs-2'
import styled from 'styled-components'

const Container = styled.div``

const options = { maintainAspectRatio: false, legend: { display: false }, tooltips: { enabled: true } }
const data = {
	labels: [
		'Circle #1',
		'Circle #2',
		'Circle #3'
	],
	datasets: [{
		data: [300, 50, 100],
		backgroundColor: [
			'#003f5c',
			'#2f4b7c',
			'#665191',
			'#a05195',
			'#d45087',
			'#f95d6a',
			'#ff7c43',
			'#ffa600',
		],
		hoverBackgroundColor: [
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

export default () => <Container><Pie options={options} data={data} /></Container>