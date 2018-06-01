export default ({ mode, onChangeMode = () => {} }) => (
  <div className='container'>
    <h1 className='is-size-1'><span className='is-hidden-mobile'>FFXIV</span> Pocketcraft
    <div className='mode-setting tags has-addons is-pulled-right'>
      <span className='tag is-light' onClick={onChangeMode('light')}>
          Light {mode === 'light' ? '✔' : ''}
      </span>
      <span className='tag is-dark' onClick={onChangeMode('dark')}>
          Dark {mode === 'dark' ? '✔' : ''}
      </span>
    </div>
    </h1>
  </div>
)
