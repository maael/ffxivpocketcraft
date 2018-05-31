export default ({ item, showHave, showClass, showDelete, onDelete, type }) => {
  const { id, name, have, need, class_name } = item
  return (
    <div className='card is-pulled-left'>
      <div className='card-content'>
        <p className='subtitle'>
          <a href={`http://xivdb.com/${type}/${id}/${name.replace(/\s/g, '+')}`}>{name}</a> {showHave && <span className={`tag is-rounded is-tiny ${have.length === need.length ? 'is-success' : ''}`}>{have.length}/{need.length}</span>} {showClass && <img src={`/public/imgs/${class_name}.png`} title={class_name} />} {showDelete && <button className='delete' onClick={onDelete}></button>}
        </p>
      </div>
    </div>
  )
}
