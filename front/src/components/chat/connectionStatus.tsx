type ConnectionStatusProps = {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <p className="connection-status">
      Status: {isConnected ? 'Connected to realtime chat' : 'Connecting to realtime chat...'}
    </p>
  )
}
