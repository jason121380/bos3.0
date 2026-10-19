/** @jsxImportSource @emotion/react */
import { Input } from '@mui/material'
import { Button } from 'ui/button'
import { Search as SearchIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2)
  }),
  search: css({
    flexGrow: 1,
    height: 42,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center'
  }),
  searchIcon: css({
    marginRight: theme.spacing(2),
    color: theme.palette.icon,
  }),
  searchInput: css({
    flexGrow: 1,
  }),
  searchButton: css({
    backgroundColor: theme.palette.common.white,
  }),
}

function Search({ onSearch, className, ...rest }) {
  const [keyword, setKeyword] = useState('')
  const handleOnChange = e => setKeyword(e.target.value)
  const handleOnKeyPress = e => {
    if (e.key === 'Enter') {
      onSearch(keyword)
    }
  }
  return (
    <div {...rest} css={css([styles.root, className])}>
      <div css={styles.search} className="rounded-md bg-background">
        <SearchIcon css={styles.searchIcon} />
        <Input
          css={styles.searchInput}
          disableUnderline
          placeholder="搜尋關鍵字"
          value={keyword}
          onChange={handleOnChange}
          onKeyUp={handleOnKeyPress}
        />
      </div>
      <Button
        css={styles.searchButton}
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
  className: PropTypes.object,
  onSearch: PropTypes.func,
}

export default Search
