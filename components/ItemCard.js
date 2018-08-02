export default ({ item, showHave, showClass, showDelete, onDelete, type }) => {
  const { id, name, have, need, class_name: className } = item
  return (
    <div className='card is-pulled-left'>
      <div className='card-content'>
        <p className='subtitle'>
          <a href={`http://xivdb.com/${type}/${id}/${name.replace(/\s/g, '+')}`}>{name}</a> {showHave && <span className={`tag is-rounded is-tiny ${have.length === need.length ? 'is-success' : ''}`}>{have.length}/{need.length}</span>} {showClass && <img src={`/public/imgs/${className}.png`} title={className} />} {showDelete && <button className='delete' onClick={onDelete} />}
        </p>
      </div>
    </div>
  )
}
