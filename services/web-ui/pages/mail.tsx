import Head from 'next/head'
import Link from 'next/link'
import Center from '../components/Center'
import Template from '../components/Template'
import { Wrapper, FormWrapper } from './login'
import cfg from '../config/ui'


export const Page = ({ user }) => {
  return (
    <Template user={user}>
      <Head>
        <title>Email Confirmation</title>
      </Head>
      <Wrapper>
        <Center>
          <FormWrapper>
              <Center>
                  <h2>Your email has been confirmed.</h2>
              </Center>
          </FormWrapper>
          <p><Link href="/login"><a>Back to login</a></Link></p>
        </Center>
      </Wrapper>
    </Template>
  )
}

Page.getInitialProps = async () => {
  const jwt = 'from router'
  // const confirmationRes = await fetch(`${cfg.api.host}/mail/confirm?jwt=${jwt}`)
  // const success = await confirmationRes.json()
  return { jwt }
}

export default Page
