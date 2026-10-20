import { Input } from 'ui/text-field'
import { Button } from 'ui/button'
import { Search as SearchIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import React, { useState } from 'react'

// 本檔沒有 @jsxImportSource，原 emotion css prop 只會被當成 DOM 屬性（css="[object Object]"），從未生效；清理時直接移除，外觀不變

function Search({ onSearch, className, ...rest }) {
  const [keyword, setKeyword] = useState('')
  const handleOnChange = e => setKeyword(e.target.value)
  return (
    <div {...rest}>
      <div className="rounded-md bg-background">
        <SearchIcon />
        <Input
          disableUnderline
          placeholder="搜尋關鍵字"
          value={keyword}
          onChange={handleOnChange}
        />
      </div>
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
