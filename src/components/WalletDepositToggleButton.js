/** @jsxImportSource @emotion/react */
import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { useEffect, useMemo, useCallback } from 'react'

const WALLET_ACTIONS = {
  ADD: { value: 'ADD', label: '儲值' },
  MINUS: { value: 'MINUS', label: '扣除' }
}

const styles = {
  button: css({
    whiteSpace: 'nowrap'
  })
}

function WalletDepositToggleButton({
  value, onChange, disabled = false, identity
}) {
    // 按鈕配置
    const buttons = useMemo(() => {
      const availableButtons = []
      if (identity.allowDepositAddition) {
        availableButtons.push(WALLET_ACTIONS.ADD)
      }
      if (identity.allowDepositDeduction) {
        availableButtons.push(WALLET_ACTIONS.MINUS)
      }
      return availableButtons
    }, [identity.allowDepositAddition, identity.allowDepositDeduction])
  
    // 更新 moneyStatus
    const handleChange = useCallback((e, newValue) => {
      if (newValue) {
        onChange(newValue)
      }
    }, [onChange])

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={handleChange}
    >
      {buttons.map(({ value: btnValue, label }) => (
        <ToggleButton 
          key={btnValue}
          css={styles.button} 
          disabled={disabled} 
          value={btnValue}
        >
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

WalletDepositToggleButton.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  identity: PropTypes.shape({
    allowDepositAddition: PropTypes.bool.isRequired,
    allowDepositDeduction: PropTypes.bool.isRequired
  }).isRequired
}

export default WalletDepositToggleButton