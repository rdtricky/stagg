import Head from 'next/head'
import { commaNum } from '@stagg/util'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import Center from '../components/Center'
import Template from '../components/Template'

const GameWrapper = styled.div`
    position: relative;
    font-family: "Open Sans Condensed", Verdana, Arial, Helvetica, sans-serif;
    border-radius: 0.5rem;
    box-shadow: 0px 0px 30px -15px #999999 inset;
    background-image: url('/assets/img/cod.banner.png');
    background-repeat:no-repeat;
    background-size: cover;
    background-position: center center;
    background-color: rgba(0, 0, 0, 0.5);
    min-width: 300px;
    min-height: 120px;
    width: 25vw;
    height: 10vw;
    img {
        min-width: 220px;
        width: 18vw;
    }
    h2 {
        margin: -10px 0 0 0;
        padding: 0;
        font-size: 26px;
        font-weight: bold;
        font-style: normal;
        text-transform: uppercase;
        text-rendering: optimizeLegibility;
    }
    p {
        position: absolute;
        bottom: -0.5rem;
        width: 100%;
        text-align: center;
    }
`
const Page = ({ players, matches, performances }) => {
    return (
        <Template>
            <Head>
                <title>Call of Duty - Warzone</title>
            </Head>
            <h1 style={{textAlign: 'center'}}>Supported Games</h1>
            <Center>
                <GameWrapper>
                    <Center>
                        <div>
                            <img src="/assets/img/cod.png" alt="Call of Duty" />
                            <h2>Modern Warfare</h2>
                        </div>
                        <p>{ commaNum(players) } players | { commaNum(performances) } matches | { commaNum(matches * 147) } enemies</p>
                    </Center>
                </GameWrapper>
            </Center>
        </Template>
    )
}

Page.getInitialProps = async () => {
    const res = await fetch('http://localhost:8080/api/meta')
    const json = await res.json()
    return { ...json }
}

export default observer(Page)
