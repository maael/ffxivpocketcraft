import React from 'react'
import axios from 'axios'
import Bookmarklet from '../Bookmarlet'

const PLACEHOLDER = 'Please place items here, separated by a newline'

export default class RetainerLoader extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toParse: PLACEHOLDER,
      prepared: [],
      imported: {},
      loading: false,
      error: undefined
    }
    this.onChange = this.onChange.bind(this)
    this.load = this.load.bind(this)
    this.onClear = this.onClear.bind(this)
    this.prepare = this.prepare.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
  }

  onChange (e) {
    this.setState({ [e.target.name]: e.target.value }, this.prepare)
  }

  onFocus () {
    if (this.state.toParse === PLACEHOLDER) this.setState({ toParse: '' })
  }

  onBlur () {
    if (!this.state.toParse.trim()) this.setState({ toParse: PLACEHOLDER })
  }

  prepare () {
    const { toParse } = this.state
    const prepared = toParse.trim().split('\n')
      .map((i) => {
        const trimmed = i.trim()
        const match = trimmed.match(/(.+)\s+[0-9]{1,3}?/)
        return match ? match[1].trim() : trimmed
      }).filter(Boolean)
    this.setState({ prepared })
  }

  load (e) {
    e.preventDefault()
    const { onLoad = () => {} } = this.props
    const { prepared } = this.state
    axios.post('/api/items/retainer', { potentials: prepared })
      .then(({ data }) => {
        this.setState({ imported: { length: data.length, finished: true } }, () => {
          onLoad(data)
        })
      })
      .catch((e) => {
        console.error('[error]', e)
      })
  }

  onClear () {
    const { onClear } = this.props
    this.setState({ classLevels: {} }, onClear)
  }

  render () {
    const { toParse, prepared, imported, loading, error } = this.state

    return (
      <div>
        <Bookmarklet />
        <p className='control'>
          <textarea
            style={{marginTop: '0.4rem'}}
            className='input'
            value={toParse}
            name='toParse'
            onChange={this.onChange}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
          />
        </p>
        <p>Found {prepared.length} item{prepared.length === 1 ? '' : 's'}</p>
        <p>{!imported.finished ? null : `Imported ${imported.length || 0} crafting item${imported.length === 1 ? '' : 's'}`}</p>
        <div className='input-field field has-addons'>
          <form onSubmit={this.load}>
            <p className='control'>
              <a className={`button ${loading ? 'is-loading' : ''}`} onClick={this.load} disabled={!toParse.length}>
                Load
              </a>
            </p>
          </form>
        </div>
        {!error ? null : (
          <div className='notification is-danger'>
            {error}
          </div>
        )}
      </div>
    )
  }
}
