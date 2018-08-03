import SettingsContext from '../contexts/Settings'
const translations = require('../../translations.json')

export default function Translation ({ msg }) {
  return (
    <SettingsContext.Consumer>
      {({ settings }) => (translations[settings.language][msg] ? translations[settings.language][msg] : translations['en'][msg]) || 'Missing translation'}
    </SettingsContext.Consumer>
  )
}
