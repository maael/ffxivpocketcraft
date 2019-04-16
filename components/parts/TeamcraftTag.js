export default ({link}) => (
  <div className='teamcraft-tag' style={{display: 'inline-block', position: 'relative', left: 20, top: -4}}>
    <label className='checkbox'>
      <div className='tags has-addons'>
        <a href={link} style={{cursor: 'pointer'}} className='tag is-info'>
          Open in Teamcraft
        </a>
      </div>
    </label>
  </div>
)
