type ErrorBannerProps = {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) {
    return null
  }

  return <p className="error-text">{message}</p>
}
