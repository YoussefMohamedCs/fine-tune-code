import React from 'react'

export default function UserComponent({UserText}) {
  return (
    <div className='userComponent w-100'>
      <div className='userMessage'>
{UserText}
      </div>
    </div>
  )
}
