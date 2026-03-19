import { RscEntryLexicalField } from '@payloadcms/richtext-lexical/rsc'
import { getTranslation } from '@payloadcms/translations'

type Props = Parameters<typeof RscEntryLexicalField>[0]
type TranslationLabel = Parameters<typeof getTranslation>[0]

type LabelLikeField = {
  label?: unknown
  required?: boolean
}

type NamedClientField = {
  name?: string
}

export default async function ProjectDescriptionField(props: Props) {
  const field = props.field as LabelLikeField | undefined
  const clientField = props.clientField as NamedClientField
  const label = getTranslation((field?.label ?? 'Description') as TranslationLabel, props.i18n)
  const path = props.path ?? clientField.name ?? 'description'
  const required = Boolean(field?.required)

  return (
    <div className="stable-description-field">
      <div className="stable-description-field__shell">
        <label className="field-label" htmlFor={`field-${path.replace(/\./g, '__')}`}>
          {label}
          {required ? <span className="required">*</span> : null}
        </label>
        <div className="stable-description-field__shimmer shimmer-effect">
          <div className="shimmer-effect__shine" />
        </div>
      </div>
      <div className="stable-description-field__field">
        <RscEntryLexicalField {...props} />
      </div>
    </div>
  )
}
