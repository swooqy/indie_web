import './App.css'
import { ChatComposer, ChatShell, ConnectionStatus, ErrorBanner, MessageList } from './components'
import { useChatSession } from './hooks/useChatSession'

function App() {
  const {
    nickname,
    messageText,
    messages,
    errorText,
    isSocketConnected,
    isSubmitting,
    isSendDisabled,
    isLoadingOlderMessages,
    hasMoreMessages,
    setNickname,
    setMessageText,
    handleSubmit,
    loadOlderMessages,
  } = useChatSession()

  return (
    <ChatShell>
      <ConnectionStatus isConnected={isSocketConnected} />
      <ErrorBanner message={errorText} />
      <MessageList
        messages={messages}
        onLoadOlderMessages={loadOlderMessages}
        isLoadingOlderMessages={isLoadingOlderMessages}
        hasMoreMessages={hasMoreMessages}
      />
      <ChatComposer
        nickname={nickname}
        messageText={messageText}
        onNicknameChange={setNickname}
        onMessageTextChange={setMessageText}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSendDisabled={isSendDisabled}
      />
    </ChatShell>
  )
}

export default App
