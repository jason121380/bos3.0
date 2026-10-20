/** @jsxImportSource @emotion/react */
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 2,
    lineHeight: '10px',
    fontSize: '10px',
    height: 20,
    minWidth: 20,
    whiteSpace: 'nowrap',
    padding: theme.spacing(0.5, 1),
  }),
  rounded: css({
    borderRadius: 10,
    padding: theme.spacing(0.5),
  }),
}

function Label({ className, variant, color, shape, children, style, ...rest }) {
  const rootCss = css([
    className, styles.root, shape === 'rounded' ? styles.rounded : {}
  ])
  const finalStyle = { ...style }

  if (variant === 'contained') {
    finalStyle.backgroundColor = color
    finalStyle.color = '#FFF'
  } else {
    finalStyle.border = `1px solid ${color}`
    finalStyle.color = color
  }
  return (
    // 原 Typography overline（span、字重 500）；字級／行高由 styles.root（10px）決定，顏色由 style 決定
    <span {...rest} css={rootCss} style={finalStyle} className="m-0 font-medium">
      {children}
    </span>
  )
}

Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  color: PropTypes.string,
  shape: PropTypes.oneOf(['square', 'rounded']),
  style: PropTypes.object,
  variant: PropTypes.oneOf(['contained', 'outlined']),
}

Label.defaultProps = {
  style: {},
  color: 'rgb(var(--text-secondary))',
  variant: 'contained',
  shape: 'square',
  className: {}
}

export default Label
