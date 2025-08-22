import React from 'react'
import Navbar from './navbar'
import Sidebar from './sidebar'
function Computer() {
  return (
    <>
    
    <div className='flex'>
        <Sidebar />
        <div className='sm:p-6 p-2'>
            No Computers Syncing
        </div>
    </div>
    </>
  )
}

export default Computer