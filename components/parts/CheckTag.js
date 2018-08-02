export default ({ label, className = '', checked = false, onClick = () => {} }) => (
  <div className={className}>
    <label className='checkbox' onClick={onClick}>
        <div className='tags has-addons'>
          <span className='tag is-info'>
              {label}
          </span>
          <span className='tag'>
              <input type='checkbox' checked={checked} />
          </span>
        </div>
    </label>
  </div>
)
