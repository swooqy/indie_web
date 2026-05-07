import type {
  SubmitEventHandler,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

type BaseField = {
  id: string
  label: string
  className?: string
}

type InputField = BaseField & {
  kind: 'input'
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>
}

type TextareaField = BaseField & {
  kind: 'textarea'
  textareaProps: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>
}

export type GenericFormField = InputField | TextareaField

type GenericFormProps = {
  className?: string
  fields: GenericFormField[]
  onSubmit: SubmitEventHandler<HTMLFormElement>
  submitLabel: string
  submittingLabel?: string
  isSubmitting?: boolean
  isSubmitDisabled?: boolean
}

export function GenericForm({
  className,
  fields,
  onSubmit,
  submitLabel,
  submittingLabel = 'Submitting...',
  isSubmitting = false,
  isSubmitDisabled = false,
}: GenericFormProps) {
  return (
    <form className={className} onSubmit={onSubmit}>
      {fields.map((field) => (
        <div key={field.id} className={field.className ?? 'form-row'}>
          <label htmlFor={field.id}>{field.label}</label>

          {field.kind === 'input' ? (
            <input id={field.id} {...field.inputProps} />
          ) : (
            <textarea id={field.id} {...field.textareaProps} />
          )}
        </div>
      ))}

      <button type="submit" disabled={isSubmitDisabled}>
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  )
}
