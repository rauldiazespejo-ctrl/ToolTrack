import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  FallbackComponent: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode
  onReset?: () => void
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch() {}

  resetErrorBoundary = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.error) {
      return <this.props.FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
    }
    return this.props.children
  }
}
