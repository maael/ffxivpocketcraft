import SettingsContext from '../contexts/Settings'

export default ({ label = '', className = '', checked = false, onClick = () => {} }) => (
  <SettingsContext.Consumer>
    {({ settings, updateSettings }) => settings.server ? (
      <div className={className}>
        <label className='checkbox' onClick={onClick}>
          <div className='tags has-addons'>
            <span className='tag is-info'>
              {label}
            </span>
            <span className='tag' style={{padding: 0}}>
              <select value={settings.sort} onChange={({target}) => updateSettings({ sort: target.value })}>
                <option value="completion">Completion</option>
                <option value="market">Market Price</option>
              </select>
            </span>
          </div>
        </label>
      </div>
    ) : null}
  </SettingsContext.Consumer>
)
