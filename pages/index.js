import qs from 'querystring'
import React from 'react'
import getConfig from 'next/config'
import axios from 'axios'
import localforage from 'localforage'
import { setup } from 'axios-cache-adapter'
import debounce from 'lodash.debounce'
import ReactGA from 'react-ga'
import { FaFilter } from 'react-icons/fa'
import ItemCard from '../components/ItemCard'
import Header from '../components/Header'
import Head from '../components/Head'
import Footer from '../components/Footer'
import DohCheckboxes from '../components/DohCheckboxes'
import ItemAutocomplete from '../components/ItemAutocomplete'
import Filter from '../components/RecipeFilter'
import Settings from '../components/Settings'
import LodestoneLevels from '../components/parts/LodestoneLevels'

const { publicRuntimeConfig: config } = getConfig()

if (config.gaTrackingID) ReactGA.initialize(config.gaTrackingID);

const apiStore = localforage.createInstance({
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE
  ],
  name: 'pocketcraftapi'
})

const localStore = localforage.createInstance({
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE
  ],
  name: 'pocketcraft'
})

const api = setup({
  cache: {
    maxAge: 5 * 60 * 1000,
    store: apiStore,
    exclude: {
      query: false
    }
  }
})

const STORAGE_KEYS = {
  selectedItems: 'pocketcraft/selectedItems',
  suggestions: 'pocketcraft/suggestions',
  settings: 'pocketcraft/settings',
  userDOH: 'pocketcraft/userDOH',
  recipeFilter: 'pocketcraft/recipeFilter',
  openFilter: 'pocketcraft/openFilter'
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
      },
      recipeFilter: {
        ilvl: '',
        clvl: '',
        quickSynth: false,
        canHQ: false
      },
      openFilter: false
    }
    this.getSuggestions = debounce(this.getSuggestions.bind(this), 100)
    this.setDOH = this.setDOH.bind(this)
    this.autoCompleteOnChange = this.autoCompleteOnChange.bind(this)
    this.autoCompleteOnSelect = this.autoCompleteOnSelect.bind(this)
    this.autoCompleteUpdate = debounce(this.autoCompleteUpdate.bind(this), 200)
    this.onChangeMode = this.onChangeMode.bind(this)
    this.clearAll = this.clearAll.bind(this)
    this.toggleRecipeFilter = this.toggleRecipeFilter.bind(this)
    this.updateRecipeFilter = this.updateRecipeFilter.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.clearClassLevels = this.clearClassLevels.bind(this)
  }

  componentDidMount () {
    if (config.gaTrackingID) ReactGA.pageview(window.location.pathname + window.location.search);
    Promise.all(Object.values(STORAGE_KEYS).map((key) => localStore.getItem(key)))
      .then(([ selectedItems, suggestions, settings, userDOH, recipeFilter, openFilter ]) => {
        let initialState = { loaded: true }
        if (window.location.search.includes('reset')) {
          localStorage.clear()
        } else {
          initialState = Object.assign({}, initialState, {
            selectedItems: selectedItems || this.state.selectedItems,
            suggestions: suggestions || this.state.suggestions,
            settings: settings || this.state.settings,
            userDOH: userDOH || this.state.userDOH,
            recipeFilter: recipeFilter || this.state.recipeFilter,
            openFilter: openFilter || this.state.openFilter
          })
        }
        this.setState(initialState)
      })
  }

  static getDerivedStateFromProps (props, state) {
    if (state.loaded) {
      ['light', 'dark'].forEach((mode) => document.body.classList.remove(mode))
      document.body.classList.add(state.settings.mode)
      Object.entries(STORAGE_KEYS).forEach(([key, value]) => localStore.setItem(value, state[key]))
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
    const { selectedItems, userDOH, recipeFilter, settings } = this.state
    const items = selectedItems.map(({ id }) => id).join(',')
    const dohs = userDOH.join(',')
    const classLevels = settings.classLevels ? encodeURIComponent(qs.stringify(settings.classLevels)) : undefined
    const filters = encodeURIComponent(qs.stringify(recipeFilter))
    if (!items) return this.setState({ suggestions: [] })
    api.get(`/api/recipes?items=${items}&classes=${dohs}&filter=${filters}${classLevels ? `&classLevels=${classLevels}` : ''}`)
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

  toggleRecipeFilter () {
    this.setState({ openFilter: !this.state.openFilter })
  }

  updateRecipeFilter (field, state) {
    this.setState({ recipeFilter: Object.assign({}, this.state.recipeFilter, { [field]: state }) }, this.getSuggestions)
  }

  saveSettings (newSettings) {
    this.setState({ settings: Object.assign({}, this.state.settings, newSettings) }, this.getSuggestions)
  }

  clearClassLevels () {
    const settings = Object.assign({}, this.state.settings)
    delete settings.classLevels
    this.setState({ settings }, this.getSuggestions)
  }

  render () {
    const { items, itemsSearch, selectedItems, suggestions, userDOH, settings, recipeFilter, openFilter } = this.state
    const isDark = settings.mode === 'dark'
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
          <span className='icon is-large recipe-filter' onClick={this.toggleRecipeFilter} title='Filters'><FaFilter size='2em' /></span>
          <Settings settings={settings} save={this.saveSettings} onClearClassLevels={this.clearClassLevels} />
          <Filter open={openFilter} filter={recipeFilter} onChange={this.updateRecipeFilter} />
          <div>
            {!settings.classLevels ? null : <LodestoneLevels classLevels={settings.classLevels} isDark={isDark} onClear={this.clearClassLevels} /> }
            <DohCheckboxes onClick={this.setDOH} userDOH={userDOH} />
          </div>

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
