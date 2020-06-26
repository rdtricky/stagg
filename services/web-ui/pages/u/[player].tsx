import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardPage from '../../components/DashboardPage'

export default () => {
  const router = useRouter()
  if (!router.query.player) {
    return null
  }
  const [player, idSuffix] = (router.query.player as string).split('@')
  const username = !idSuffix ? player : `${player}#${idSuffix}`

  return (
    <>
        <Head>
            <title>{ username } - Call of Duty Warzone</title>
        </Head>
        <DashboardPage isolate={''} />
    </>
  )
}
