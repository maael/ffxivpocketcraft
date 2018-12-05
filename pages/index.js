import qs from 'querystring'
import React from 'react'
import getConfig from 'next/config'
import localforage from 'localforage'
import { setup } from 'axios-cache-adapter'
import debounce from 'lodash.debounce'
import ReactGA from 'react-ga'
import { FaFilter, FaSync } from 'react-icons/fa'
import ItemCard from '../components/ItemCard'
import Header from '../components/Header'
import Head from '../components/Head'
import Footer from '../components/Footer'
import DohCheckboxes from '../components/DohCheckboxes'
import ItemAutocomplete from '../components/ItemAutocomplete'
import Filter from '../components/RecipeFilter'
import Settings from '../components/Settings'
import LodestoneLevels from '../components/parts/LodestoneLevels'
import CheckTag from '../components/parts/CheckTag'
import SettingsContext from '../components/contexts/Settings'
import Translation from '../components/parts/Translation'
import SortTag from '../components/parts/SortTag'
import ServerTag from '../components/parts/ServerTag'

const { publicRuntimeConfig: config } = getConfig()

if (config.gaTrackingID) ReactGA.initialize(config.gaTrackingID)

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
        mode: 'light',
        completeOnly: false,
        language: 'en'
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
    this.saveState = this.saveState.bind(this)
    this.clearClassLevels = this.clearClassLevels.bind(this)
    this.toggleCompleteOnly = this.toggleCompleteOnly.bind(this)
    this.completeRefresh = this.completeRefresh.bind(this)
    this.getTooltips = this.getTooltips.bind(this)
    this.refresh = this.refresh.bind(this)
  }

  componentDidMount () {
    if (config.gaTrackingID) ReactGA.pageview(window.location.pathname + window.location.search)
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
        this.setState(initialState, () => {
          this.getTooltips()
        })
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

  getTooltips () {
    const { settings } = this.state
    XIVDBTooltips.options.language = settings.language
    XIVDBTooltips.get()
  }

  completeRefresh (cb) {
    const { selectedItems, suggestions } = this.state
    this.setState({ selectedItems: [], suggestions: [] }, () => {
      this.setState({ selectedItems, suggestions }, () => {
        this.getTooltips()
        cb()
      })
    })
  }

  autoCompleteOnChange (event, itemsSearch) {
    this.setState({ itemsSearch })
    this.autoCompleteUpdate(itemsSearch)
  }

  autoCompleteUpdate (itemsSearch) {
    const { language } = this.state.settings
    const crystalExclusions = [ 'Crystal', 'Cristal', 'Kristall', 'ククリリススタタルル' ]
    api.get(`/api/items?q=${encodeURIComponent(itemsSearch)}&lang=${language}`)
      .then(({ data }) => {
        this.setState({ items: data.filter(({ category_name: cName }) => !crystalExclusions.includes(cName)) })
      })
      .catch((e) => {
        console.log('error', e)
      })
  }

  autoCompleteOnSelect (_, item) {
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
    api.get(`/api/recipes?items=${items}&classes=${dohs}&filter=${filters}&completeOnly=${settings.completeOnly}${classLevels ? `&classLevels=${classLevels}` : ''}${settings.server ? `&server=${settings.server}` : ''}`)
      .then(({ data }) => {
        this.setState({ suggestions: data }, () => {
          this.getTooltips()
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

  saveState (key) {
    return (update, options = { uniqueField: 'id' }) => {
      function unique (el, i, ar) {
        return ar.findIndex((el2) => el2[options.uniqueField] === el[options.uniqueField]) === i
      }
      const state = Object.assign({}, this.state)
      const value = this.state[key]
      if (Array.isArray(value)) state[key] = (state[key] || []).concat(update).filter(unique)
      else if (typeof value === 'object') Object.assign(state[key], update)
      else state[key] = update
      this.setState(state, () => {
        if (key === 'settings' && update.language) {
          this.completeRefresh(() => {
            this.getSuggestions()
          })
        } else {
          this.getSuggestions()
        }
      })
    }
  }

  clearClassLevels () {
    const settings = Object.assign({}, this.state.settings)
    delete settings.classLevels
    this.setState({ settings }, this.getSuggestions)
  }

  toggleCompleteOnly () {
    const { settings } = this.state
    const newSettings = Object.assign({}, settings, { completeOnly: !settings.completeOnly })
    this.setState({ settings: newSettings }, () => {
      this.getTooltips()
    })
  }

  sort (arr, settings) {
    if (settings.sort === 'market') {
      const sortFn = (a, b) => {
        return b.markets[settings.server].lowest.normal - a.markets[settings.server].lowest.normal;
      }
      return arr
        .filter((a) =>
          a.markets &&
          a.markets[settings.server] &&
          a.markets[settings.server].lowest &&
          a.markets[settings.server].lowest.normal
        ).sort(sortFn).concat(arr.filter((a) =>
          !a.markets ||
          !a.markets[settings.server] ||
          !a.markets[settings.server].lowest ||
          !a.markets[settings.server].lowest.normal
        ).sort((a, b) => b.completion - a.completion))
    } else {
      const sortFn = (a, b) => {
        const completionDiff = b.completion - a.completion;
        if (completionDiff === 0 && a.markets && a.markets[settings.server] && b.markets && b.markets[settings.server]) {
          return b.markets[settings.server].lowest.normal - a.markets[settings.server].lowest.normal;
        } else {
          return completionDiff;
        }
      }
      return arr.sort(sortFn)
    }
  }

  refresh () {
    api.cache.clear(() => {
      this.getSuggestions()
    })
  }

  render () {
    const { items, itemsSearch, selectedItems, suggestions, userDOH, settings, recipeFilter, openFilter } = this.state
    const isDark = settings.mode === 'dark'
    let embellishedSuggestions = suggestions.map((suggestion) => {
      suggestion.have = suggestion.tree.filter((item) => selectedItems.some((selected) => selected.id === item.id))
      suggestion.need = suggestion.tree.filter((item) => item.category_name !== 'Crystal')
      suggestion.completion = (suggestion.have.length / suggestion.need.length)
      return suggestion
    })
    embellishedSuggestions = this.sort(embellishedSuggestions, settings)
    const finalSuggestions = !settings.completeOnly ? embellishedSuggestions : embellishedSuggestions.filter((item) => (
      item.need.length === item.have.length
    ))
    return (
      <SettingsContext.Provider value={{ settings, updateSettings: this.saveState('settings'), isDark: (settings) => settings.mode === 'dark' }}>
        <div>
          <Header settings={settings} onChangeMode={this.onChangeMode} />
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
            <Settings
              settings={settings}
              save={this.saveState}
              onClearClassLevels={this.clearClassLevels}
              onChangeMode={this.onChangeMode}
            />
            <Filter open={openFilter} filter={recipeFilter} onChange={this.updateRecipeFilter} />
            <div>
              {!settings.classLevels ? null : <LodestoneLevels classLevels={settings.classLevels} isDark={isDark} onClear={this.clearClassLevels} /> }
              <DohCheckboxes onClick={this.setDOH} userDOH={userDOH} />
            </div>

            <h1 className='is-size-3'>{selectedItems.length} Selected <button onClick={this.clearAll} className='delete is-medium clear-all' /></h1>
            <div className='selected'>{selectedItems.map((item, i) => (
              <ItemCard item={item} key={item._id} showDelete onDelete={this.deleteSelected(i)} type='item' />
            ))}</div>

            <h1 className='is-size-3'>
              {finalSuggestions.length} Suggestions ({finalSuggestions.filter((item) => item.need.length === item.have.length).length} complete)
              <CheckTag label={<Translation msg='filterCompleteOnly' />} className='complete-check' checked={settings.completeOnly} onClick={this.toggleCompleteOnly} />
              <ServerTag label='Server' className='server-select' />
              <SortTag label='Sort by' className='sort-select' />
              {settings.server ? (
                <div onClick={this.refresh} className='refresh' title='Refresh suggestions'>
                  <FaSync size='0.5em' />
                </div>
              ) : null}
            </h1>
            <div className='suggestions'>{finalSuggestions.map((item) => (
              <ItemCard server={settings.server} item={item} key={item._id} showClass showHave type='recipe' />
            ))}
            </div>
          </div>
          <Footer />
        </div>
      </SettingsContext.Provider>
    )
  }
}

export default Index
