import axios from 'axios'
import config from '../config'
export default async (query:string) => {
    try {
        const { data } = await axios.get(`${config.http.host}/u/search/${query}`)
        return data
    } catch(e) {
        throw e.response.data.error
    }
}