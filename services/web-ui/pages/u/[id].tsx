import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import Center from '../../components/Center'
import Template from '../../components/Template'
import Line from '../../components/charts/base/Line'
import Polar from '../../components/charts/base/Polar'
import Radar from '../../components/charts/base/Radar'
import Pie from '../../components/charts/base/Pie'

const inferUsername = (id:string) => {
    const [name, slug] = id.split('@')
    return !slug ? name : `${name}#${slug}`
}

const Page = ({ user, count, domain }) => {
  const router = useRouter()
  const [performances, setPerformances] = useState([])
  const username = inferUsername(router.query.id as string)
  const isMe = user?.profiles?.uno === username
  useEffect(() => {
      (async () => {
        const download = await fetch(`${domain}/api/download`)
        const performances = await download.json()
        setPerformances(performances)
      })()
  }, [])

  return (
    <Template user={user} domain={domain}>
        <Head>
            <title>{ isMe ? '(ME) ' : '' }{ username } : { count.performances } Matches | Call of Duty Warzone</title>
        </Head>
        <Center>
            {
                !performances.length ? <h1>Loading { count.performances } matches...</h1> : (
                    <>
                        
                        <Card label={`${performances.map(p => p.stats.kills).reduce((a,b) => a+b, 0)} kills`}>
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
                        <Card label="SPM Timeline" large expandable>
                            <Line />
                        </Card>
                        <Card label="SPM Timeline" large expandable>
                            <Line />
                        </Card>
                        <Card label="Kills by Rank" expanded large>
                            <Line />
                        </Card>
                    </>
                )
            }
        </Center>
    </Template>
  )
}

Page.getInitialProps = async ({ query }) => {
    const username = inferUsername(query.id)
    console.log(JSON.stringify({ username, platform: 'uno' }))
    const ping = await fetch('http://localhost:8080/api/ping', {
        method: 'POST',
        body: JSON.stringify({ username, platform: 'uno' })
    })
    const { performances } = await ping.json()
    return { count: { performances } }
}

export default Page
