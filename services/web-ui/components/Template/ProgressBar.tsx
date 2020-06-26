import Link from 'next/link'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { Types } from '../../store'

export const MainProgressBarWrapper = styled.div`
    width: 25vw;
    height: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.5);
`

export const SmallProgressBarWrapper = styled.div`
    width: 100%;
    height: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.5);
`

export const ProgressBar = styled.div`
    display: block;
    content: "";
    height: 100%;
    max-width: 100%;
`

export const ProfileSyncHeader = styled.label`
    display: block;
    margin: 0;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-bottom: none;
    font-size: 0.75rem;
    width: 10vw;
`

export const ProfileSyncProgressBar = observer(({ profile }:Props.ProfileLoader) => {
    let progress = -1
    let color = '#28a745'
    let counterDisplay = ''
    if (profile.sync?.status === Types.Profile.Status.Loading) {
        color = '#007bff'
        const loaded = profile.sync?.loaded || 0
        progress = loaded / profile.sync.recorded
        if (loaded || profile.sync.recorded)
            counterDisplay = `${loaded} / ${profile.sync.recorded}`
    }
    if (profile.sync?.status === Types.Profile.Status.Downloading) {
        const matches = profile.sync?.matches || 0
        const performances = profile.sync?.performances || 0
        const minDown = Math.min(matches, performances)
        progress = minDown / profile.sync.expected
        if (minDown || profile.sync.expected)
            counterDisplay = `${minDown} / ${profile.sync.expected}`
    }
    const Counter = () => <div style={{float: 'right'}}>{ counterDisplay }</div>
    return (
        <div className="profile-sync-wrapper">
            <ProfileSyncHeader>
                <Link href="/u/[player]" as={`/u/${profile.username}`}>
                    <a>{ profile.username }</a>
                </Link>
                <Counter />
            </ProfileSyncHeader>
            {
                progress < 0 || progress >= 1 ? null : (
                    <SmallProgressBarWrapper className="progress-bar-wrapper">
                        <Main progress={progress} color={color} />
                    </SmallProgressBarWrapper>
                )
            }
        </div>
    )
})

export namespace Props {
    export interface ProgressBar {
        progress: number
        color?: string
    }
    export interface ProfileLoader {
        profile: Types.Profile
    }
}

const Main = ({ progress, color }:Props.ProgressBar) => {
    return (
        <ProgressBar className="progress-bar" style={{ width: `${progress*100}%`, backgroundColor: color || 'green' }} />
    )
}
export default Main
