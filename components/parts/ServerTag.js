import ServerSelect from './ServerSelect'

export default ({ label = '', className = '', checked = false, onClick = () => {} }) => (
  <div className={className}>
    <label className='checkbox' onClick={onClick}>
      <div className='tags has-addons'>
        <span className='tag is-info'>
          {label}
        </span>
        <span className='tag' style={{padding: 0}}>
          <ServerSelect />
        </span>
      </div>
    </label>
  </div>
)
