/** @jsxImportSource @emotion/react */
import { Button, Collapse, ListItem } from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { NavLink as RouterLink, useHistory, useLocation } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  item: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start !important',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
    '& .MuiCollapse-root': {
      width: '100%'
    }
  }),
  itemLeaf: css({
    display: 'flex',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  }),
  button: css({
    color: '#3C4043 !important',
    fontSize: '14px !important',
    padding: '8px 16px !important',
    margin: '2px 8px !important',
    borderRadius: '0px !important',
    justifyContent: 'flex-start !important',
    textTransform: 'none',
    letterSpacing: '0 !important',
    width: '100%',
    fontWeight: '500 !important',
  }),
  buttonLeaf: css({
    fontSize: '14px !important',
    color: '#5F6368 !important',
    padding: '8px 16px 8px 48px !important',
    margin: '2px 8px !important',
    borderRadius: '0px !important',
    justifyContent: 'flex-start !important',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
    fontWeight: '500 !important',
    '&.depth-0': {
      fontWeight: '500 !important',
    },
    '&:hover': {
      color: '#000000 !important',
      backgroundColor: 'rgba(0, 0, 0, 0.05) !important',
    },
  }),
  icon: css({
    color: '#5F6368 !important',
    display: 'flex',
    alignItems: 'center',
    marginRight: '12px !important',
  }),
  expandIcon: css({
    marginLeft: 'auto',
    height: '16px !important',
    width: '16px !important',
  }),
  label: css({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
  }),
  active: css({
    backgroundColor: 'rgba(0, 122, 255, 0.1) !important',
    color: '#007AFF !important',
    fontWeight: '600 !important',
    borderRadius: '0px !important',
    '& $icon': {
      color: '#007AFF !important',
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 122, 255, 0.15) !important',
    },
  }),
}

function NavItem({
  title,
  href,
  depth,
  children,
  icon: Icon,
  className,
  open: openProp,
  label: Label,
  reportListExtended,
  ...rest
}) {
  const history = useHistory()
  const location = useLocation()
  const [open, setOpen] = useState(openProp)

  const handleToggle = () => {
    !(title === '報表及分析' && !reportListExtended) && setOpen(prevOpen => !prevOpen)
  }

  let paddingLeft = 8

  if (depth > 0) {
    paddingLeft = 32 + 8 * depth
  }

  const style = {
    paddingLeft,
  }

  if (children) {
    return (
      <ListItem
        {...rest}
        css={css([styles.item, className])}
        disableGutters key={title}
        onClick={() => (title === '報表及分析' && !reportListExtended) && history.push('/dashboard-list-detail')}
      >
        <Button css={styles.button} onClick={handleToggle} style={style}>
          {Icon && <Icon css={styles.icon} />}
          {title}
          {(title === '報表及分析' && !reportListExtended) ? '' : open ? (
            <ExpandLessIcon css={styles.expandIcon} color="inherit" />
          ) : (
            <ExpandMoreIcon css={styles.expandIcon} color="inherit" />
          )}
        </Button>
        <Collapse id='aaddss' style={{ width: '100% !important' }} in={open}>{children}</Collapse>
      </ListItem>
    )
  }

  return (
    <ListItem {...rest} css={css([styles.itemLeaf, className])} disableGutters key={title}>
      <Button
        className={`depth-${depth}`}
        css={css([styles.buttonLeaf, location.pathname === href ? styles.active : {}])}
        component={RouterLink}
        exact
        style={style}
        to={href}
      >
        {Icon && <Icon css={styles.icon} />}
        {title}
        {Label && (
          <span css={styles.label}>
            <Label />
          </span>
        )}
      </Button>
    </ListItem>
  )
}

NavItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.object,
  depth: PropTypes.number.isRequired,
  href: PropTypes.string,
  icon: PropTypes.any,
  label: PropTypes.any,
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
}

NavItem.defaultProps = {
  open: false,
  className: {}
}

export default NavItem
