import Head from 'next/head'
import { observer } from 'mobx-react-lite'
import Wait from '../components/Wait'
import Card from '../components/Card'
import Center from '../components/Center'
import Provider from '../components/Provider'
import Template from '../components/Template'
import Line from '../components/charts/base/Line'
import Polar from '../components/charts/base/Polar'
import Radar from '../components/charts/base/Radar'
import Pie from '../components/charts/base/Pie'
import DamagePerKill from '../components/charts/DamagePerKill'

interface Props {
    isolate?: string // key of player you want to isolate
}
export default observer(({ isolate }:Props) => {
    return (
        <Template>
            <Head>
                <title>Call of Duty - Warzone</title>
            </Head>
            <Center>
                <Provider>
                    <Wait />
                    <Card label="Downs by Circle">
                        <Pie />
                    </Card>
                    <Card label="Rank by Mode">
                        <Polar />
                    </Card>
                    <Card label="Rank by Mode">
                        <Radar />
                    </Card>
                    <Card label="Rank by Mode">
                        <Radar />
                    </Card>
                    <DamagePerKill />
                    <Card label="SPM Timeline" large expandable>
                        <Line />
                    </Card>
                    <Card label="Kills by Rank" expanded large>
                        <Line />
                    </Card>
                </Provider>
            </Center>
        </Template>
    )
})
