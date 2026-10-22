import PropTypes from 'prop-types'

import Search from './Search'
import SearchV2 from './SearchV2'

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
    <div {...rest} className="box-border gap-6 flex items-center justify-between flex-wrap">
      {onSearch ? (
        <div className="min-w-0 max-w-full">
          <Search className="grow basis-[480px]" onSearch={onSearch} />
        </div>
      ) : (
        ''
      )}
      {onSearchV2 ? (
        <div className="w-full">
          <SearchV2
            setCustomerNoSort={setCustomerNoSort}
            className="grow basis-[480px]"
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
            getQuery={getQuery}
          />
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

SearchBar.propTypes = {
  className: PropTypes.string,
  onFilter: PropTypes.func,
  onSearch: PropTypes.func,
}

export default SearchBar
