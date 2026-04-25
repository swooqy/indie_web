const getDefaultWebSocketAddress = (backendAddress: string) => {
  const backendRootAddress = backendAddress.endsWith('/api') ? backendAddress.slice(0, -4) : backendAddress

  if (backendRootAddress.startsWith('http://') || backendRootAddress.startsWith('https://')) {
    try {
      const backendUrl = new URL(backendRootAddress)
      const wsProtocol = backendUrl.protocol === 'https:' ? 'wss' : 'ws'
      return `${wsProtocol}://${backendUrl.host}/ws`
    } catch {
      // Fall through to runtime host based default.
    }
  }

  if (typeof window !== 'undefined') {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    return `${wsProtocol}://${window.location.host}/ws`
  }

  return 'ws://localhost:8080/ws'
}

export const BACKEND_ADDRESS = import.meta.env.VITE_BACKEND_ADDRESS ?? '/api'
export const WEBSOCKET_ADDRESS =
  import.meta.env.VITE_WEBSOCKET_ADDRESS ?? getDefaultWebSocketAddress(BACKEND_ADDRESS)
