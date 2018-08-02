import React from 'react'
import axios from 'axios'
import cheerio from 'cheerio'
import LodestoneLevels from './parts/LodestoneLevels'

export default class LodestoneLoader extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      url: '',
      classLevels: props.settings.classLevels || {},
      loading: false,
      error: undefined
    }
    this.onChange = this.onChange.bind(this)
    this.load = this.load.bind(this)
    this.onClear = this.onClear.bind(this)
  }

  onChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  load (e) {
    e.preventDefault()
    const { onLoad } = this.props
    const { url } = this.state
    this.setState({ loading: true, error: undefined }, () => {
      axios.get(`/api/proxy?url=${encodeURIComponent(url)}`).then(({ data }) => {
        const $ = cheerio.load(data)
        const classDetails = $('.character__level:nth-of-type(4) li')
        const classLevels = Array.prototype.reduce.call(classDetails, (ob, { children }) => {
          return Object.assign(ob, { [children[0].attribs['data-tooltip']]: Number($(children[1]).text()) })
        }, {})
        this.setState({ classLevels, loading: false }, () => {
          if (onLoad) onLoad(classLevels)
        })
      }, (err) => {
        this.setState({ error: err.response.data.err || 'An unknown error occurred, please try again later', loading: false })
      })
    })
  }

  onClear () {
    const { onClear } = this.props
    this.setState({ classLevels: {} }, onClear)
  }

  render () {
    const { settings } = this.props
    const { url, classLevels, loading, error } = this.state
    const isDark = settings.mode === 'dark'

    return (
      <div>
        <div className='input-field field has-addons'>
          <form onSubmit={this.load}>
            <p className='control'>
              <input
                className='input'
                name='url'
                type='text'
                placeholder='Lodestone Character URL'
                value={url}
                onChange={this.onChange}
              />
            </p>
            <p className='control'>
              <a className={`button ${loading ? 'is-loading' : ''}`} onClick={this.load} disabled={!url.length}>
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
        <LodestoneLevels classLevels={classLevels} isDark={isDark} onClear={this.onClear} />
      </div>
    )
  }
}
