import React from 'react'
import Modal from 'react-modal'
import { FaWrench } from 'react-icons/fa'
import LoadstoneLoader from './loaders/Lodestone'
import RetainerLoader from './loaders/Retainer'
import ModeSettings from './parts/ModeSettings'
import Translation from './parts/Translation'
import ServerSelect from './parts/ServerSelect'
import SettingsContext from './contexts/Settings'

Modal.setAppElement('#__next')

const languages = [ 'en', 'de', 'fr', 'ja' ]

export default class Settings extends React.Component {
  constructor () {
    super()
    this.state = {
      open: false
    }
    this.changeModal = this.changeModal.bind(this)
    this.onLoadLodestone = this.onLoadLodestone.bind(this)
    this.onLoadRetainer = this.onLoadRetainer.bind(this)
    this.onLanguageClick = this.onLanguageClick.bind(this)
  }

  changeModal (state) {
    return () => {
      this.setState({ open: state })
    }
  }

  onLoadLodestone (save) {
    return (classLevels) => {
      if (save) save({ classLevels: classLevels })
    }
  }

  onLoadRetainer (settings, save) {
    return (items) => {
      console.log('saving', items, settings, save)
      if (save) save('selectedItems')(items)
    }
  }

  onLanguageClick (save) {
    return (language) => {
      return () => {
        if (save) save({ language })
      }
    }
  }

  render () {
    const { onClearClassLevels, onChangeMode, save } = this.props
    const { open } = this.state

    function getStyles (settings, isDark) {
      return {
        overlay: {
          backgroundColor: 'rgba(1,22,30, 0.8)'
        },
        content: {
          backgroundColor: isDark(settings) ? '#02222E' : '#FFFFFF',
          border: 'none'
        }
      }
    }

    return (
      <SettingsContext.Consumer>
        {({ settings, updateSettings, isDark }) => (
          <div>
            <span className='icon is-large settings-icon' onClick={this.changeModal(true)} title='Filters'><FaWrench size='2em' /></span>
            <Modal
              isOpen={open}
              onRequestClose={this.changeModal(false)}
              contentLabel='Settings'
              style={getStyles(settings, isDark)}
            >
              <div className='settings'>
                <h1 className={`title ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsTitle' /></h1>
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsColourMode' /></h2>
                <ModeSettings settings={settings} onChangeMode={onChangeMode} />
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsLoadLodestone' /></h2>
                <p><Translation msg='settingsLoadLoadstoneDesc' /></p>
                <LoadstoneLoader settings={settings} onLoad={this.onLoadLodestone(updateSettings)} onClear={onClearClassLevels} />
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsLanguage' /></h2>
                <div className='columns is-mobile is-multiline is-centered has-text-centered'>
                  {languages.map((lang) => (
                    <div className='column is-one-fifth' key={lang}>
                      <p className={`notification is-icon ${lang === settings.language ? 'is-active' : ''}`} onClick={this.onLanguageClick(updateSettings)(lang)}>
                        <img className='flag-icon' src={`/public/imgs/flags/${lang}.png`} />
                      </p>
                    </div>
                  ))}
                </div>
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsLoadRetainer' /></h2>
                <ol style={{marginLeft: 25, marginBottom: 5}}>
                  <li><Translation msg='settingsLoadRetainerDesc1' /></li>
                  <li><Translation msg='settingsLoadRetainerDesc2' /></li>
                  <li><Translation msg='settingsLoadRetainerDesc3' /></li>
                  <li><Translation msg='settingsLoadRetainerDesc4' /></li>
                </ol>
                <p><Translation msg='settingsLoadRetainerDesc5' /></p>
                <p><Translation msg='settingsLoadRetainerDesc6' /></p>
                <RetainerLoader settings={settings} onLoad={this.onLoadRetainer(settings, save)} onClear={onClearClassLevels} />
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsServer' /></h2>
                <p><Translation msg='settingsServerDesc' /></p>
                <div className='has-text-centered'><ServerSelect /></div>
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsQuantityMode' /></h2>
                <p><Translation msg='settingsQuantityModeDesc' /></p>
                <h2 className={`subtitle ${isDark(settings) ? 'has-text-light' : ''}`}><Translation msg='settingsImport' /></h2>
                <p><Translation msg='settingsImportDesc' /></p>
              </div>
            </Modal>
          </div>
        )}
      </SettingsContext.Consumer>
    )
  }
}
