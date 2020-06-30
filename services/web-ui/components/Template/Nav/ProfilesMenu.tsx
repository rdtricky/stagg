import { useRef, useContext, useState } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { ProfileSyncProgressBar } from '../ProgressBar'
import * as Store from '../../../store'
import { useOnClickOutside } from '../../../hooks'

const Wrapper = styled.span`
    margin-left: 1rem;
    aside {
        z-index: 3;
        label {
            display: block;
            width: 100%;
        }

        .profile-sync-wrapper label {
            border: none;
        }
    }
`

export default observer(() => {
    const ref = useRef()
    const store = useContext(Store.Context)
    const [open, setOpen] = useState(false)
    useOnClickOutside(ref, () => setOpen(false))
    return (
        <Wrapper ref={ref} className={[open ? 'open' : '', 'menu-wrapper'].join(' ')}>
            {
                !open ? null : (
                    <aside>
                        <label>Profiles</label>
                        {
                            store.profiles.map((profile:Store.Types.Profile) => <ProfileSyncProgressBar key={profile.key} profile={profile} />)
                        }
                    </aside>
                )
            }
            <div className={[open ? 'open' : '', 'menu-button'].join(' ')} onClick={() => setOpen(!open)}>
                <i className="icon-users" />
            </div>
        </Wrapper>
    )
})