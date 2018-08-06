import SettingsContext from '../contexts/Settings'
let translations = {}

try {
  translations = require('../../translations.json')
} catch (e) {}

export default function Translation ({ msg }) {
  return (
    <SettingsContext.Consumer>
      {({ settings }) => {
        try {
          return (translations[settings.language][msg] ? translations[settings.language][msg] : translations['en'][msg]) || '[Missing translation]'
        } catch (e) {
          console.error('[Translation]', 'Failed', e)
          return '[Missing translation]'
        }
      }}
    </SettingsContext.Consumer>
  )
}
