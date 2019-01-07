import React from 'react'
import axios from 'axios'
import SettingsContext from '../contexts/Settings'

export default class ServerSelect extends React.Component {
  state = {
    loaded: false,
    servers: {}
  }

  componentDidMount() {
    if (Object.keys(this.state.servers) === 0) {
      axios.get('/api/xivapi/servers').then(({ data: servers }) => {
        let cleanedServers = servers;
        if (cleanedServers) {
          cleanedServers = cleanedServers.reduce((pre, cur) => {
            return {
              ...pre,
              [cur.dc]: pre[cur.dc] ? pre[cur.dc].concat(cur) : [cur]
            }
          }, {})
        }
        this.setState({ servers: cleanedServers, loaded: true })
      }).catch(console.error)
    }
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
                {servers[dataCenter].map(({server, enabled}) => (
                  <option key={server} disabled={!enabled}>{server}</option>
                ))}
              </optgroup>
            )) : <option disabled>Loading...</option>}
          </select>
        )}
      </SettingsContext.Consumer>
    )
  }
}
