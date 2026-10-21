import { Input } from 'ui/text-field'
import { Button } from 'ui/button'
import { Search as SearchIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { cn } from 'ui/utils'

function Search({ onSearch, className = '', ...rest }) {
  const [keyword, setKeyword] = useState('')
  const handleOnChange = e => setKeyword(e.target.value)
  const handleOnKeyPress = e => {
    if (e.key === 'Enter') {
      onSearch(keyword)
    }
  }
  return (
    <div {...rest} className={cn('flex items-center gap-[16px]', className)}>
      <div className="grow h-[42px] py-0 px-[16px] flex items-center rounded-md bg-background">
        <SearchIcon className="mr-[16px] text-accent" />
        <Input
          className="grow"
          disableUnderline
          placeholder="搜尋關鍵字"
          value={keyword}
          onChange={handleOnChange}
          onKeyUp={handleOnKeyPress}
        />
      </div>
      {/* 原 emotion 白底會蓋過 primary 藍底（白底白字看不到），移除後即為標準主要按鈕 */}
      <Button
        onClick={() => onSearch(keyword)}
        size="lg"
        variant="primary"
      >
        搜尋
      </Button>
    </div>
  )
}

Search.propTypes = {
  className: PropTypes.string,
  onSearch: PropTypes.func,
}

export default Search
