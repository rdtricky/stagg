import Head from 'next/head'
import Router from 'next/router'
import Cookies from 'js-cookie'
import styled from 'styled-components'
import { useState, useEffect, useContext } from 'react'
import { TextField, Button } from '@material-ui/core'
import Center from '../components/Center'
import Template from '../components/Template'
import LoginService from '../services/login'
import * as Store from '../store'
import config from '../config'

export const Wrapper = styled.div`
  height: 80vh;
  margin-bottom: -30rem;
  .centered-container {
    flex-direction: column !important;
    flex-wrap: no-wrap !important;
    margin: auto !important;
  }
`

export const FormWrapper = styled.div`
    border-radius: 0.5rem;
    box-shadow: 0px 0px 30px -15px #999999 inset;
    background-image: url('/assets/img/cod.banner.png');
    background-repeat:no-repeat;
    background-position: center center;
    background-color: rgba(0, 0, 0, 0.5);
    min-width: 560px;
    width: 60vw;
    max-width: 1440px;
    min-height: 500px;
    height: 20vw;
    img {
        width: 24rem;
        margin-bottom: 1rem;
    }
    font-family: "Open Sans Condensed", Verdana, Arial, Helvetica, sans-serif;
    h2 {
        font-size: 22px;
        font-spacing: normal;
        font-weight: bold;
        font-style: normal;
        text-transform: uppercase;
        text-rendering: optimizeLegibility;
    }
`

export const InputWrapper = styled.div`
    * {
        color: white !important;
        border-color: white !important;
        width: 100%;
        text-align: left;
    }
    button {
        background-color: #0d121a;
        background-image: url('/assets/img/dots.png'); border: 1px solid #81898c;
        box-shadow: 0px 0px 30px -15px #999999 inset;
        transition: all 0.4s ease-in-out;
    }
    position: relative;
    margin: 0 auto;
    width: 24rem;
    text-align: center;

    .response {
      text-align: center;
      color: red !important;
      height: 0;
      line-height: 0;
      padding: 0;
      margin: 0;
      position: relative;
      bottom: -1.5rem;
    }

    .response a {
      color: red !important;
    }
    .response.success, .response.success * {
      color: green !important;
    }
`

export const Spacer = styled.div`
    height: 0.5rem;
`

export default () => {
  const store = useContext(Store.Context)
  const cookie = Cookies.get('player')
  const [res, setRes] = useState({ error: false, msg: '' })
  const [disabled, setDisabled] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [player, setPlayer] = useState(!cookie ? null : JSON.parse(cookie))
  const login = async () => {
    if (!loginEmail) return setRes({ error: true, msg: 'email required' })
    if (!loginPassword) return setRes({ error: true, msg: 'password required' })
    setRes({ error: false, msg: '' })
    setDisabled(true)
    try {
      const { email, profiles } = await LoginService(loginEmail, loginPassword)
      if (!email || !profiles || !Object.keys(profiles).length) {
        setRes({ error: true, msg: 'login failed' })
        return
      }
      setRes({ error: false, msg: 'login successful, forwarding to dashboard...' })
      setTimeout(() => setPlayer({ email, profiles }), config.login.forward.delay)
    } catch(e) {
      if (e?.toLowerCase().includes('captcha')) {
        e = <a href={config.login.forgot.url} target="_blank">{e}</a>
      }
      setRes({ error: true, msg: e })
      setDisabled(false)
    }
  }
  useEffect(() => {
    if (player) {
      Cookies.set('player', JSON.stringify(player), { expires: 365 })
      store.addProfile({
        mode: 'wz',
        platform: 'ATV',
        username: player.profiles.ATV
      })
      Router.push(config.login.forward.url)
    }
  }, [player])
  return (
    <Template>
      <Head>
        <title>Sign in to your Call of Duty account</title>
      </Head>
      <Wrapper>
        <Center>
          <FormWrapper>
              <Center>
                  <h2>JOIN THE WORLD OF</h2>
                  <img src="/assets/img/cod.png" alt="Call of Duty" />
                  <h2>SIGN IN TO YOUR CALL OF DUTY ACCOUNT</h2>
                  <InputWrapper>
                      <TextField autoComplete={'false'} label="Email" variant="outlined" onChange={e => setLoginEmail(e.target.value)} />
                      <Spacer />
                      <TextField autoComplete={'false'} label="Password" type="password" variant="outlined" onChange={e => setLoginPassword(e.target.value)} />
                      <Spacer />
                      <Button disabled={disabled} onClick={login} variant="contained" color="primary">{ disabled ? 'Loading...' : 'Sign In' }</Button>
                      <p className={['response', res.error ? '' : 'success'].join(' ')}>{res.msg}</p>
                  </InputWrapper>
              </Center>
          </FormWrapper>
          <p><a href="https://profile.callofduty.com/cod/forgotPassword" target="_blank">Trouble signing in?</a></p>
        </Center>
      </Wrapper>
    </Template>
  )
}
