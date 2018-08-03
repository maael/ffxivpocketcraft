import Translation from './Translation'

export default function ModeSettings ({ settings, onChangeMode, isTop }) {
  return (
    <div className={`mode-setting tags has-addons ${isTop ? 'is-pulled-right is-top is-hidden-mobile' : ''}`}>
      <span className='tag is-light' onClick={onChangeMode('light')}>
        <Translation msg='settingsColourModeLight' /> {settings.mode === 'light' ? '✔' : ''}
      </span>
      <span className='tag is-dark' onClick={onChangeMode('dark')}>
        <Translation msg='settingsColourModeDark' /> {settings.mode === 'dark' ? '✔' : ''}
      </span>
    </div>
  )
}
