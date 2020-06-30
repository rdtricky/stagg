import { useRef, useState } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '../../../hooks'

const Wrapper = styled.span`
    margin-left: 1.25rem;
    img {
        width: 1.75rem;
        height: 1.75rem;
        position: relative;
        top: -0.2rem;
        right: 3px;
    }
    aside {
        z-index: 4;
    }
    .menu-button {
        position: relative;
        top: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.5);
    }
`

export default () => {
    const ref = useRef()
    const [open, setOpen] = useState(false)
    useOnClickOutside(ref, () => setOpen(false))
    return (
        <Wrapper ref={ref} className={[open ? 'open' : '', 'menu-wrapper'].join(' ')}>
            {
                !open ? null : (
                    <aside>
                        <label>MellowD</label>
                        
                    </aside>
                )
            }
            <div className={[open ? 'open' : '', 'menu-button'].join(' ')} onClick={() => setOpen(!open)}>
                <img src="https://www.callofduty.com/cdn/app/icons/mw/ranks/mp/icon_rank_155.png" alt="Rank 155" />
            </div>
        </Wrapper>
    )
}