import React from 'react'
import axios from 'axios'
import SettingsContext from '../contexts/Settings'

export default class ServerSelect extends React.Component {
  state = {
    loaded: false,
    servers: {}
  }

  componentDidMount() {
    axios.get('/api/xivapi/servers').then(({ data: servers }) => {
      this.setState({ servers, loaded: true })
    }).catch(console.error)
  }

  render() {
    const { loaded, servers } = this.state
    return (
      <SettingsContext.Consumer>
        {({ settings, updateSettings }) => (
          <select value={settings.server} onChange={({target}) => updateSettings({ server: target.value })}>
            <option></option>
            {loaded ? Object.keys(servers).map((dataCenter) => (
              <optgroup key={dataCenter} label={dataCenter}>
                {servers[dataCenter].map((server) => (
                  <option key={server}>{server}</option>
                ))}
              </optgroup>
            )) : <option disabled>Loading...</option>}
          </select>
        )}
      </SettingsContext.Consumer>
    )
  }
}
