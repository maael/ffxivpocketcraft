import React from 'react'
import axios from 'axios'
import localforage from 'localforage'
import { setup } from 'axios-cache-adapter'
import debounce from 'lodash.debounce'
import ItemCard from '../components/ItemCard'
import Header from '../components/Header'
import Head from '../components/Head'
import Footer from '../components/Footer'
import DohCheckboxes from '../components/DohCheckboxes'
import ItemAutocomplete from '../components/ItemAutocomplete'

const store = localforage.createInstance({
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE
  ],
  name: 'pocketcraft'
})

const api = setup({
  cache: {
    maxAge: 5 * 60 * 1000,
    store,
    exclude: {
      query: false
    }
  }
})

const STORAGE_KEYS = {
  selectedItems: 'pocketcraft/selectedItems',
  suggestions: 'pocketcraft/suggestions',
  settings: 'pocketcraft/settings',
  userDOH: 'pocketcraft/userDOH'
}

class Index extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      itemsSearch: '',
      items: [],
      selectedItems: [],
      suggestions: [],
      userDOH: [],
      loaded: false,
      settings: {
        mode: 'light'
      }
    }
    this.getSuggestions = debounce(this.getSuggestions.bind(this), 100)
    this.setDOH = this.setDOH.bind(this)
    this.autoCompleteOnChange = this.autoCompleteOnChange.bind(this)
    this.autoCompleteOnSelect = this.autoCompleteOnSelect.bind(this)
    this.autoCompleteUpdate = debounce(this.autoCompleteUpdate.bind(this), 200)
    this.onChangeMode = this.onChangeMode.bind(this)
    this.clearAll = this.clearAll.bind(this)
  }

  componentDidMount () {
    const selectedItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.selectedItems)) || this.state.selectedItems
    const suggestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.suggestions)) || this.state.suggestions
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || this.state.settings
    const userDOH = JSON.parse(localStorage.getItem(STORAGE_KEYS.userDOH)) || this.state.userDOH
    if (window.location.search.includes('reset')) {
      localStorage.clear()
      return this.setState({ loaded: true })
    }
    this.setState({ loaded: true, selectedItems, suggestions, settings, userDOH })
  }

  static getDerivedStateFromProps (props, state) {
    if (state.loaded) {
      ['light', 'dark'].forEach((mode) => document.body.classList.remove(mode))
      document.body.classList.add(state.settings.mode)
      localStorage.setItem(STORAGE_KEYS.selectedItems, JSON.stringify(state.selectedItems))
      localStorage.setItem(STORAGE_KEYS.suggestions, JSON.stringify(state.suggestions))
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings))
      localStorage.setItem(STORAGE_KEYS.userDOH, JSON.stringify(state.userDOH))
    }
    return state
  }

  autoCompleteOnChange (event, itemsSearch) {
    this.setState({ itemsSearch })
    this.autoCompleteUpdate(itemsSearch)
  }

  autoCompleteUpdate (itemsSearch) {
    api.get(`/api/items?q=${encodeURIComponent(itemsSearch)}`)
      .then(({ data }) => {
        this.setState({ items: data.filter(({ category_name }) => category_name !== 'Crystal') })
      })
      .catch((e) => {
        console.log('error', e)
      })
  }

  autoCompleteOnSelect (itemsSearch, item) {
    const { selectedItems } = this.state
    if (selectedItems.some((selected) => selected.id === item.id)) return this.setState({ itemsSearch: '', items: [] })
    this.setState({ selectedItems: selectedItems.concat(item), itemsSearch: '', items: [] }, this.getSuggestions)
  }

  getSuggestions () {
    const { selectedItems, userDOH } = this.state
    const items = selectedItems.map(({ id }) => id).join(',')
    const dohs = userDOH.join(',')
    if (!items) return this.setState({ suggestions: [] })
    api.get(`/api/recipes?items=${items}&classes=${dohs}`)
      .then(({ data }) => {
        this.setState({ suggestions: data }, () => {
          XIVDBTooltips.get()
        })
      })
  }

  deleteSelected (index) {
    return () => {
      const { selectedItems } = this.state
      const deleted = [].concat(selectedItems)
      deleted.splice(index, 1)
      this.setState({ selectedItems: deleted }, this.getSuggestions)
    }
  }

  setDOH (e) {
    const { userDOH } = this.state
    const dohSet = new Set(userDOH)
    dohSet[e.target.checked ? 'add' : 'delete'](e.target.value)
    this.setState({ userDOH: [ ...dohSet ] }, this.getSuggestions)
  }

  onChangeMode (mode) {
    return () => {
      this.setState({ settings: Object.assign({}, this.state.settings, { mode }) })
    }
  }

  clearAll () {
    this.setState({ selectedItems: [] }, this.getSuggestions)
  }

  render () {
    const { items, itemsSearch, selectedItems, suggestions, userDOH, settings } = this.state
    const embellishedSuggestions = suggestions.map((suggestion) => {
      suggestion.have = suggestion.tree.filter((item) => selectedItems.some((selected) => selected.id === item.id))
      suggestion.need = suggestion.tree.filter((item) => item.category_name !== 'Crystal')
      suggestion.completion = (suggestion.have.length / suggestion.need.length)
      return suggestion
    }).sort((a, b) => b.completion - a.completion)
    return (
      <div>
        <Header mode={settings.mode} onChangeMode={this.onChangeMode} />
        <div className='container search'>
          <Head />
          <ItemAutocomplete
            value={itemsSearch}
            items={items}
            onSelect={this.autoCompleteOnSelect}
            onChange={this.autoCompleteOnChange}
          />
        </div>
        <div className='container items'>
          <DohCheckboxes onClick={this.setDOH} userDOH={userDOH} />

          <h1 className='is-size-3'>{selectedItems.length} Selected <button onClick={this.clearAll} className='delete is-medium clear-all'></button></h1>
          <div className='selected'>{selectedItems.map((item, i) => (
            <ItemCard item={item} key={item._id} showDelete onDelete={this.deleteSelected(i)} type='item' />
          ))}</div>

          <h1 className='is-size-3'>{embellishedSuggestions.length} Suggestions ({embellishedSuggestions.filter((item) => item.need.length === item.have.length).length} complete)</h1>
          <div className='suggestions'>{embellishedSuggestions.map((item) => (
            <ItemCard item={item} key={item._id} showClass showHave type='recipe' />
          ))}
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

export default Index
