import { cloneElement } from 'react'
import styled from 'styled-components'

const Container = styled.main`
    padding: 1rem;
    min-height: calc(90vh - 4rem);
`

export default (props) => {
    const passableProps = {...props}
    delete passableProps.children
    return (
        <Container>
            { props.children.map((child,key) => cloneElement(child, { key, ...passableProps })) }
        </Container>
    )
}