/** @jsxImportSource @emotion/react */
import { Grid } from '@mui/material'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Search from './Search'
import SearchV2 from './SearchV2'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  }),
  search: css({
    flexGrow: 1,
    // maxWidth: 480,
    flexBasis: 480,
  }),
  filterButton: css({
    marginLeft: 'auto',
  }),
  filterIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function SearchBar({
  setCustomerNoSort,
  onFilter,
  onSearch,
  onSearchV2,
  onDesignerV2,
  onDesignerV3,
  onBirthdayStart,
  onIsUnwelcome,
  disableCustomerSource,
  onCustomerSource,
  handleClearData,
  inCustomerFilterExport,
  setBelong,
  setCustomerIsCome,
  getQuery,
  ...rest
}) {
  return (
    <Grid {...rest} css={styles.root} container spacing={3}>
      {onSearch ? (
        <Grid item>
          <Search className={styles.search} onSearch={onSearch} />
        </Grid>
      ) : (
        ''
      )}
      {onSearchV2 ? (
        <Grid style={{ width: '100%' }} item>
          <SearchV2
            setCustomerNoSort={setCustomerNoSort}
            className={styles.search}
            onSearchV2={onSearchV2}
            onDesignerV2={onDesignerV2}
            onDesignerV3={onDesignerV3}
            onCustomerSource={onCustomerSource}
            onBirthdayStart={onBirthdayStart}
            onIsUnwelcome={onIsUnwelcome}
            disableCustomerSource={disableCustomerSource}
            handleClearData={handleClearData}
            inCustomerFilterExport={inCustomerFilterExport}
            setBelong={setBelong}
            setCustomerIsCome={setCustomerIsCome}
            getQuery
          />
        </Grid>
      ) : (
        ''
      )}
    </Grid>
  )
}

SearchBar.propTypes = {
  className: PropTypes.string,
  onFilter: PropTypes.func,
  onSearch: PropTypes.func,
}

export default SearchBar
