import PropTypes from 'prop-types'
import { cn } from 'ui/utils'

// 原 emotion styles（spacing 單位 8px）逐值轉 Tailwind；順序同原 css([className, root, rounded])，後者覆蓋前者
const styles = {
  root: 'inline-flex items-center justify-center grow-0 shrink-0 rounded-[2px] leading-[10px] text-[10px] h-[20px] min-w-[20px] whitespace-nowrap py-[4px] px-[8px]',
  rounded: 'rounded-[10px] p-[4px]',
}

function Label({ className, variant, color, shape, children, style, ...rest }) {
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
    <span {...rest} style={finalStyle} className={cn('m-0 font-medium', className, styles.root, shape === 'rounded' && styles.rounded)}>
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
  className: ''
}

export default Label
