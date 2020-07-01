import cookie from 'cookie'
import App, { AppProps } from 'next/app'
const PageRender = ({ Component, pageProps }:AppProps) => {
    return (
        <Component {...pageProps} />
    )
}
PageRender.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext)
    const inheritedProps = { ...appProps, pageProps: { ...appProps.pageProps } }
    const cookies = cookie.parse(appContext.ctx.req.headers.cookie || '')
    if (cookies.jwt) {
        const jwtRes = await fetch(`http://localhost:8080/api/jwt?t=${cookies.jwt}`)
        const jwtJson = await jwtRes.json()
        inheritedProps.pageProps.user = jwtJson
    }
    return inheritedProps
}
export default PageRender
