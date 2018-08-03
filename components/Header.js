import ModeSettings from './parts/ModeSettings'

export default ({ settings, onChangeMode = () => {} }) => (
  <div className='container'>
    <h1 className='is-size-1'>
      <span className='is-hidden-mobile'>FFXIV</span> Pocketcraft
      <ModeSettings settings={settings} onChangeMode={onChangeMode} isTop />
    </h1>
  </div>
)
