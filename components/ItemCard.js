import format from 'date-fns/format'

const dateFormat = 'DD/MM/YYYY [at] HH:mm'

export default ({ server, item, showHave, showClass, showDelete, onDelete, type }) => {
  const { id, name, have, need, class_name: className, markets } = item

  return (
    <div className='card is-pulled-left'>
      <div className='card-content'>
        <p className='subtitle'>
          <a href={`http://xivapi.com/${type}/${id}/${name.replace(/\s/g, '+')}`}>{name}</a>
          {' '}{showHave && <span className={`tag is-rounded is-tiny ${have.length === need.length ? 'is-success' : ''}`}>{have.length}/{need.length}</span>}
          {' '}{markets && server && markets[server]? <span title={`Last updated: ${markets[server].lastUpdated ? format(markets[server].lastUpdated, dateFormat) : '??'}`} className={`tag is-rounded is-tiny`} style={{cursor: 'default'}}>{`${markets[server].lowest.normal.toLocaleString()} gil`}</span> : ''}
          {' '}{showClass && <img src={`/public/imgs/${className}.png`} title={className} />} {showDelete && <button className='delete' onClick={onDelete} />}
        </p>
      </div>
    </div>
  )
}
