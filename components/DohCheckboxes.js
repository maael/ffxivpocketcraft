const DOH_CLASSES = [ 'Alchemist','Armorer','Blacksmith','Carpenter','Culinarian','Goldsmith','Leatherworker','Weaver' ]

export default ({ userDOH, onClick }) => (
  <div className='field is-grouped is-grouped-multiline doh-tags'>
    {DOH_CLASSES.map((doh) => (
      <div className='control' key={doh}>
        <label className='checkbox' onClick={onClick}>
            <div className='tags has-addons'>
              <span className='tag is-info'>
                  {doh}
              </span>
              <span className='tag'>
                  <input type='checkbox' value={doh} checked={userDOH.includes(doh)} />
              </span>
            </div>
        </label>
      </div>
    ))}
  </div>
)
