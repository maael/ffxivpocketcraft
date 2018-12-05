import bookmarklet from './data/bookmarklet'

export default () => (
  <small>
    <a href={bookmarklet} style={{marginRight: 5}}>🔎 Pocketcraft</a>
    Drag this bookmarklet to your bookmark bar, navigate to your retainer inventory, and click it. It will show you a window with all your items in to copy and paste into Pocketcraft.
  </small>
)

export const data = bookmarklet
