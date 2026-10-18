import React, { useState } from 'react'
import { User } from 'lucide-react'
import { cn } from './utils'

// 頭像，取代 MUI Avatar：有 src 顯示圖片（載入失敗改顯示備援）；否則顯示 children（例如姓名首字）；都沒有時顯示人像圖示
const sizes = { sm: 'h-8 w-8 text-label', md: 'h-10 w-10 text-body', lg: 'h-14 w-14 text-heading' }

const Avatar = React.forwardRef(({ src, alt = '', size = 'md', className, children, imgProps, ...props }, ref) => {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed
  return (
    <span
      ref={ref}
      className={cn('relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-hover font-medium text-text-secondary', sizes[size], className)}
      {...props}
    >
      {showImage ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} {...imgProps} />
      ) : children ? (
        children
      ) : (
        <User aria-hidden="true" strokeWidth={1.75} className="h-[55%] w-[55%]" />
      )}
    </span>
  )
})
Avatar.displayName = 'Avatar'

export { Avatar }
