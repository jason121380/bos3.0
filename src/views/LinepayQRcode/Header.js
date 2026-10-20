import PropTypes from 'prop-types'

function Header({ className, ...rest }) {
  return (
    <div {...rest} className={className ? `mb-6 ${className}` : 'mb-6'}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="m-0 mb-[0.35em] text-caption font-medium text-text-secondary">
            Reservations
          </h2>
          <h1 className="m-0 text-title !font-bold text-text">
            預約記錄
          </h1>
        </div>
      </div>
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.string,
}

export default Header
