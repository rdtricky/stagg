import axios from 'axios'
import config from '../config'
export default async (email:string, password:string) => {
    try {
        const { status, data: { profiles } } = await axios.post(`${config.http.host}/u/login`, { email, password })
        return { status, email, profiles } 
    } catch(e) {
        throw e.response.data.error
    }
}