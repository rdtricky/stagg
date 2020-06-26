import styled from 'styled-components'
import SearchMenu from './SearchMenu'
import ProfilesMenu from './ProfilesMenu'
import Logo from './Logo'
import UserMenu from './UserMenu'

const Wrapper = styled.nav`
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`

const Container = styled.div`
    position: relative;
    width: 100%;
    max-width: 1280px;
    height: 2rem;
    margin: 0 auto;
`

const UserActionsContainer = styled.div`
    position: absolute;
    top: 0; right: 0;
    width: 300px;
    text-align: right;
    .menu-button {
        border-radius: 50%;
        margin-top: -1rem;
        display: inline-block;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0.5rem;
        cursor: pointer;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        transition: all 0.2s ease-in-out;
        :hover {
            border-color: #fff;
            color: #fff;
        }
    }

    aside {
        text-align: left;
        position: absolute;
        top: 3rem; right: 0;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 0.5rem;
        width: 265px;
        min-height: 95px;
    }
`

const asdf = styled.span`
    position: absolute;
    top: 0; right: 0;
    padding: 1rem;
    width: 50rem;

    background: rgba(0, 0, 0, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    width: 100%;

    > *, > * > * {
        float: right;
    }
    .menu-wrapper {
        position: relative;
        width: 3rem;
    }
    aside {
        position: absolute;
        right: 0;
        top: 3.5rem;
        padding: 0 0.5rem 0.5rem;
        width: 20rem;
        min-height: 2.5rem;
        border: 1px solid rgba(255, 255, 255, 0.5);
        background: rgba(0, 0, 0, 0.8);
    }
    .menu-button {
        width: 2.5rem;
        height: 2.5rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    .menu-button:hover {
        color: #fff;
    }
    .menu-wrapper.open .menu-button {
        border-right: none;
    }
    .menu-button > * {
        display: block;
        margin-top: 0.75rem;
    }
`
export default (props:any) => {
    return (
        <Wrapper>
            <Container>
                <Logo />
                <UserActionsContainer>
                    <SearchMenu {...props} />
                    <ProfilesMenu {...props} />
                    <UserMenu {...props} />
                </UserActionsContainer>
            </Container>
        </Wrapper>
    )
}
export const old = (props:any) => {
    return (
        <Wrapper>
            <Logo />
            <UserMenu {...props} />
            <ProfilesMenu {...props} />
            <SearchMenu {...props} />
            <div style={{clear: 'both'}} />
        </Wrapper>
    )
}