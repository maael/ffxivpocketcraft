import Tippy from '@tippy.js/react'
import 'tippy.js/dist/tippy.css'

const TipContent = ({name, item, markets, server}) => (
  <div>
    <b>{name}</b>
    <div>
      <small>{server} {server && markets && markets[server] && markets[server].lowest.normal.toLocaleString()} gil @ {server && markets && markets[server] && markets[server].lastUpdated}</small>
    </div>
  </div>
)

export default ({children, name, item, markets, server}) => (
  <Tippy content={<TipContent {...{name, item, markets, server}} />} onShow={() => {
    console.info('fetch for', item);
  }}>
    {children}
  </Tippy>
)
