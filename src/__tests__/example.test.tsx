import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing
function ExampleComponent() {
  return <div>Hello, World!</div>
}

describe('Example Component', () => {
  it('renders hello world', () => {
    render(<ExampleComponent />)
    
    const helloWorld = screen.getByText('Hello, World!')
    expect(helloWorld).toBeInTheDocument()
  })
})