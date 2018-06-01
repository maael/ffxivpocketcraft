import Autocomplete from 'react-autocomplete'

export default ({ onSelect, onChange, value, items }) => (
  <Autocomplete
    inputProps={{ className: 'input is-large search', placeholder: 'Search for items...' }}
    wrapperStyle={{ position: 'relative', display: 'block' }}
    value={value}
    items={items}
    getItemValue={(item) => item.name}
    onSelect={onSelect}
    onChange={onChange}
    renderMenu={children => (
      <div className='menu box'>
        {children}
      </div>
    )}
    open
    renderItem={(item, isHighlighted) => (
      <div
        className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
        key={item._id}
      >{item.name}</div>
    )}
  />
)
