import React from 'react'
import Modal from 'react-modal'
import { FaWrench } from 'react-icons/fa'
import LoadstoneLoader from './LodestoneLoader'
import ModeSettings from './parts/ModeSettings'

Modal.setAppElement('#__next')

export default class Settings extends React.Component {
  constructor () {
    super()
    this.state = {
      open: false
    }
    this.changeModal = this.changeModal.bind(this)
    this.onLoadLodestone = this.onLoadLodestone.bind(this)
  }

  changeModal (state) {
    return () => {
      this.setState({ open: state })
    }
  }

  onLoadLodestone (classLevels) {
    const { save } = this.props
    if (save) save({ classLevels: classLevels })
  }

  render () {
    const { settings, onClearClassLevels, onChangeMode } = this.props
    const { open } = this.state
    const isDark = settings.mode === 'dark'

    const styles = {
      overlay: {
        backgroundColor: 'rgba(1,22,30, 0.8)'
      },
      content: {
        backgroundColor: isDark ? '#02222E' : '#FFFFFF',
        border: 'none'
      }
    }

    return (
      <div>
        <span className='icon is-large settings-icon' onClick={this.changeModal(true)} title='Filters'><FaWrench size='2em' /></span>
        <Modal
          isOpen={open}
          onRequestClose={this.changeModal(false)}
          contentLabel='Settings'
          style={styles}
        >
          <div className='settings'>
            <h1 className={`title ${isDark ? 'has-text-light' : ''}`}>Settings</h1>
            <h2 className={`subtitle ${isDark ? 'has-text-light' : ''}`}>Colour Mode</h2>
            <ModeSettings mode={settings.mode} onChangeMode={onChangeMode} />
            <h2 className={`subtitle ${isDark ? 'has-text-light' : ''}`}>Load Crafters levels from Lodestone</h2>
            <p>Insert the URL to your character's lodestone here (like <a href='https://eu.finalfantasyxiv.com/lodestone/character/14985627/'>https://eu.finalfantasyxiv.com/lodestone/character/14985627/</a>), and click Load to load your crafters class levels.</p>
            <LoadstoneLoader settings={settings} onLoad={this.onLoadLodestone} onClear={onClearClassLevels} />
            <h2 className={`subtitle ${isDark ? 'has-text-light' : ''}`}>Quantity Mode</h2>
            <p>Allows you to add quantities to the items you add, and will suggest recipes using the actual quantities you have. (Work in progress)</p>
            <h2 className={`subtitle ${isDark ? 'has-text-light' : ''}`}>Import Inventories</h2>
            <p>(Work in progress)</p>
            <h2 className={`subtitle ${isDark ? 'has-text-light' : ''}`}>Language</h2>
            <p>(Work in progress)</p>
          </div>
        </Modal>
      </div>
    )
  }
}
