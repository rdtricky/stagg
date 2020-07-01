import cookie from 'cookie'
import App, { AppProps } from 'next/app'
const PageRender = ({ Component, pageProps }:AppProps) => {
    return (
        <Component {...pageProps} />
    )
}
PageRender.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext)
    const host = appContext.ctx?.req?.headers?.host || window.location.host
    const domain = host.includes('localhost') ? `http://${host}` : `https://${host}`
    const inheritedProps = { ...appProps, pageProps: { ...appProps.pageProps, domain } }
    let cookieStr = ''
    try { cookieStr = document?.cookie } catch (e) {}
    if (appContext.ctx?.req?.headers?.cookie) cookieStr = appContext.ctx.req.headers.cookie
    const cookies = cookie.parse(cookieStr)
    if (cookies.jwt) {
        const jwtRes = await fetch(`${domain}/api/jwt?t=${cookies.jwt}`)
        const jwtJson = await jwtRes.json()
        inheritedProps.pageProps.user = jwtJson
    }
    return inheritedProps
}
export default PageRender
