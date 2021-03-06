import Translation from './parts/Translation'

export default ({ open, filter, onChange }) => {
  function wrappedOnChange (field) {
    return function (e) {
      const value = e.target.hasOwnProperty('checked') ? e.target.checked : Number(e.target.value)
      onChange(field, value)
    }
  }
  return (
    !open ? null : (
      <div className='field is-grouped is-grouped-multiline filter-tags'>
        <div className='control'>
          <div className='tags has-addons'>
            <span className='tag is-info'>
              <Translation msg='filterMaxILvl' />
            </span>
            <span className='tag number-tag'>
              <input type='number' placeholder='???' value={filter.ilvl} onChange={wrappedOnChange('ilvl')} />
            </span>
          </div>
        </div>
        <div className='control'>
          <div className='tags has-addons'>
            <span className='tag is-info'>
              <Translation msg='filterMaxClassLvl' />
            </span>
            <span className='tag number-tag'>
              <input type='number' placeholder='???' value={filter.clvl} onChange={wrappedOnChange('clvl')} />
            </span>
          </div>
        </div>
        <div className='control'>
          <label className='checkbox'>
            <div className='tags has-addons'>
              <span className='tag is-info'>
                <Translation msg='filterQuickSynth' />
              </span>
              <span className='tag'>
                <input type='checkbox' checked={filter.quickSynth} onChange={wrappedOnChange('quickSynth')} />
              </span>
            </div>
          </label>
        </div>
        <div className='control'>
          <label className='checkbox'>
            <div className='tags has-addons'>
              <span className='tag is-info'>
                <Translation msg='filterHQ' />
              </span>
              <span className='tag'>
                <input type='checkbox' checked={filter.canHQ} onChange={wrappedOnChange('canHQ')} />
              </span>
            </div>
          </label>
        </div>
      </div>
    )
  )
}
