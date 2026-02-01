import { Button, Input, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
  }),
  search: css({
    flexGrow: 1,
    height: 42,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
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
    marginLeft: theme.spacing(2),
  }),
}

function Search({ onSearch, className, ...rest }) {
  const [keyword, setKeyword] = useState('')
  const handleOnChange = e => setKeyword(e.target.value)
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Paper css={styles.search} elevation={1}>
        <SearchIcon css={styles.searchIcon} />
        <Input
          css={styles.searchInput}
          disableUnderline
          placeholder="搜尋關鍵字"
          value={keyword}
          onChange={handleOnChange}
        />
      </Paper>
      {console.log('dddd')}
      <Button
        css={styles.searchButton}
        onClick={() => onSearch(keyword)}
        size="large"
        variant="contained"
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
