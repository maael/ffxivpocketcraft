import ModeSettings from './parts/ModeSettings'

export default ({ mode, onChangeMode = () => {} }) => (
  <div className='container'>
    <h1 className='is-size-1'><span className='is-hidden-mobile'>FFXIV</span> Pocketcraft
    <ModeSettings mode={mode} onChangeMode={onChangeMode} isTop/>
    </h1>
  </div>
)
