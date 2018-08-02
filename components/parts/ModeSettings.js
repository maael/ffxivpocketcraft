import React from 'react'

export default function ModeSettings ({ mode, onChangeMode, isTop }) {
  return (
    <div className={`mode-setting tags has-addons ${isTop ? 'is-pulled-right is-top is-hidden-mobile' : ''}`}>
      <span className='tag is-light' onClick={onChangeMode('light')}>
          Light {mode === 'light' ? '✔' : ''}
      </span>
      <span className='tag is-dark' onClick={onChangeMode('dark')}>
          Dark {mode === 'dark' ? '✔' : ''}
      </span>
    </div>
  )
}
