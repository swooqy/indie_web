import type { SubmitEventHandler } from 'react'
import { GenericForm, type GenericFormField } from './form'

type ChatComposerProps = {
  nickname: string
  messageText: string
  onNicknameChange: (value: string) => void
  onMessageTextChange: (value: string) => void
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isSubmitting: boolean
  isSendDisabled: boolean
}

export function ChatComposer({
  nickname,
  messageText,
  onNicknameChange,
  onMessageTextChange,
  onSubmit,
  isSubmitting,
  isSendDisabled,
}: ChatComposerProps) {
  const fields: GenericFormField[] = [
    {
      id: 'nickname',
      label: 'Nickname',
      kind: 'input',
      inputProps: {
        type: 'text',
        value: nickname,
        onChange: (event) => onNicknameChange(event.target.value),
        placeholder: 'Your name',
        maxLength: 32,
      },
    },
    {
      id: 'message',
      label: 'Message',
      kind: 'textarea',
      textareaProps: {
        value: messageText,
        onChange: (event) => onMessageTextChange(event.target.value),
        placeholder: 'Type your message...',
        rows: 3,
        maxLength: 400,
      },
    },
  ]

  return (
    <GenericForm
      className="chat-form"
      fields={fields}
      onSubmit={onSubmit}
      submitLabel="Send Message"
      submittingLabel="Sending..."
      isSubmitting={isSubmitting}
      isSubmitDisabled={isSendDisabled}
    />
  )
}
