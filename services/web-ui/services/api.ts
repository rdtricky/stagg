import axios from 'axios'
import config from '../config'
export const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))


export namespace Profile {
    const profileBaseUrl = ({ platform, username }) => 
        `${config.http.host}/u/${platform}/${encodeURIComponent(username)}`
    const req = async req => {
        try {
            const { data } = await req
            return data
        } catch(e) {
            return {}
        }
    }
    
    export const Login = async (email:string, password:string) => {
        await delay(10000)
        return { email: 'dan@mdlindsey.com', profiles: {
            BTL:"Dan#17890",
            XBL:"danL",
            ATV:"MellowD#6992980",
        } }
        const { profiles } = await req(axios.post(`${config.http.host}/u/login`, { email, password }))
        return { email, profiles }
    }
    export const Compare = async ({ mode, platform, username }, matchIds:string[]) => 
        req(axios.post(`${profileBaseUrl({platform, username})}/${mode}`, { matchIds }))
    export const Ping = async ({ platform, username }) => 
        req(axios.get(`${profileBaseUrl({platform, username})}/ping`))
    export const Search = async (username:string) => 
        req(axios.get(`${config.http.host}/u/search/${username}`))
}
