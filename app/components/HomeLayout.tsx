import React, { FC, ReactNode } from 'react'

const HomeLayout: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className='px-6 py-8'>
            {children}
        </div>
    )
}

export default HomeLayout