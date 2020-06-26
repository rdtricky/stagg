import {  useContext } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import * as Store from '../store'
import config from '../config'
import Center from './Center'

const Wrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    z-index: 1;
    width: 100%;
    text-align: center;
    background: rgba(0, 0, 0, 0.75);
`

export default observer(() => {
    const store = useContext(Store.Context)
    let atLeastOneReady = false
    for(const profile of store.profiles) {
        if (!profile.sync) continue
        const isComplete = profile.sync.status === Store.Types.Profile.Status.Complete
        const isAbandoned = profile.sync.status === Store.Types.Profile.Status.Abandoned
        const matchCount = profile.sync.loaded ? profile.sync.loaded : Math.min(profile.sync.matches, profile.sync.performances)
        const hasEnoughMatches = matchCount >= config.provider.threshold.ready
        if (isComplete || isAbandoned || hasEnoughMatches) {
            atLeastOneReady = true
            break
        }
    }
    return (
        <Wrapper>
            <Center>{ atLeastOneReady ? null : <h1>Cool stuff is coming...</h1>}</Center>
        </Wrapper>
    )
})