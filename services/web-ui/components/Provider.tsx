import { observer } from 'mobx-react-lite'
import { useState, useContext, useEffect, cloneElement } from 'react'
import * as Store from '../store'
import { subscribeAll } from '../services/worker'

export interface ProviderProps {
    data?: {
        matches?: Store.Types.MatchMap
        performances?: Store.Types.PerformanceMap
    }
}

// const useData = () => data
const globalData = { matches: {}, performances: {} }
const useGlobalData = () => ({...globalData})
export default observer(({ children }:any) => {
    // If Next rendering hasn't finished window/IndexedDB won't be available and will throw an err
    try {
        const store = useContext(Store.Context)
        const [data, setData] = useState(globalData)
        const [update, setUpdate] = useState(false)
        const callback = (key, matches, performances) => {
            const oldPerfs = globalData.performances && globalData.performances[key] ? globalData.performances[key] : {}
            const newData = useGlobalData()
            newData.matches = {...newData.matches, ...matches}
            newData.performances = {...newData.performances, [key]: {...oldPerfs, ...performances}}
            console.log('Set data to', newData)
            globalData.matches = newData.matches
            globalData.performances = newData.performances
            setUpdate(true)
        }
        useEffect(() => subscribeAll(store, callback), [store.profiles.length])
        useEffect(() => {
            setUpdate(false)
            setData(useGlobalData())
        }, [update])
        console.log('Provider passing data', {...globalData})
        const childrenWithProps = children.map((child, key) => cloneElement(child, { key, data: { ...globalData } }))
        for(const i in data) delete data[i]
        return <>{ childrenWithProps }</>
    } catch(e) {
        return <>{children}</>
    }
})
