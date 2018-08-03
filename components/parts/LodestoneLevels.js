import Translation from './Translation'

export default function LodestoneLevels ({ classLevels, isDark, onClear }) {
  return (
    <div className='field is-grouped is-grouped-multiline doh-tags lodestone-levels'>
      {!classLevels || !Object.keys(classLevels).length ? null : Object.keys(classLevels).sort()
        .map((doh) => (
          <div className='control' key={doh}>
            <div className='tags has-addons'>
              <span className='tag is-info'>
                <Translation msg={`class${doh}`} />
              </span>
              <span className={`tag ${isDark ? 'has-text-light' : ''}`}>
                {classLevels[doh]}
              </span>
            </div>
          </div>
        )
        )}
      {!classLevels || !Object.keys(classLevels).length ? null : !onClear ? null : <div className='delete-container'><a className='delete' onClick={onClear} /></div>}
    </div>
  )
}
