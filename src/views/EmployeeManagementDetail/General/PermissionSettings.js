/** @jsxImportSource @emotion/react */
import {
    FormControlLabel,
    Checkbox,
} from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { css } from '@emotion/react'

const styles = {
    root: css({
        borderRadius: '24px',
        boxShadow: 'none',
        border: 'none',
    }),
    settingsSection: css({
        padding: '32px',
    }),
    settingsTitle: css({
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'rgb(var(--text))',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    }),
    settingsTitleBar: css({
        width: '4px',
        height: '18px',
        backgroundColor: 'rgb(var(--accent))',
        borderRadius: '2px',
    }),
    checkboxGroup: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    }),
    checkboxLabel: css({
        margin: 0,
        padding: '4px 8px',
        borderRadius: '8px',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: 'rgb(var(--surface))',
        },
    }),
}

function PermissionSettings({ userDisplaySituationState, setUserDisplaySituationState }) {
    const handleUserIdentityChange = (key) => {
        setUserDisplaySituationState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }))
    }

    return (
        <div>
            <div css={styles.settingsTitle}>
                <div css={styles.settingsTitleBar} />
                權限設置
            </div>
            <div css={styles.checkboxGroup}>
                <FormControlLabel
                    css={styles.checkboxLabel}
                    control={<Checkbox color="primary" size="small" />}
                    label="出現於打單介面"
                    checked={userDisplaySituationState.isDisplayOnServiceList}
                    onChange={() => handleUserIdentityChange('isDisplayOnServiceList')}
                />
                <FormControlLabel
                    css={styles.checkboxLabel}
                    control={<Checkbox color="primary" size="small" />}
                    label="出現於預約列表"
                    checked={userDisplaySituationState.isDisplayOnBookingRecord}
                    onChange={() => handleUserIdentityChange('isDisplayOnBookingRecord')}
                />
                <FormControlLabel
                    css={styles.checkboxLabel}
                    control={<Checkbox color="primary" size="small" />}
                    label="可接受顧客預約"
                    checked={userDisplaySituationState.isDisplayOnBookingList}
                    onChange={() => handleUserIdentityChange('isDisplayOnBookingList')}
                />
                <FormControlLabel
                    css={styles.checkboxLabel}
                    control={<Checkbox color="primary" size="small" />}
                    label="包含於業績報表"
                    checked={userDisplaySituationState.isDisplayOnPerformanceList}
                    onChange={() => handleUserIdentityChange('isDisplayOnPerformanceList')}
                />
                <FormControlLabel
                    css={styles.checkboxLabel}
                    control={<Checkbox color="primary" size="small" />}
                    label="包含於薪資報表"
                    checked={userDisplaySituationState.isDisplayOnSalaryReportList}
                    onChange={() => handleUserIdentityChange('isDisplayOnSalaryReportList')}
                />
                <FormControlLabel
                    css={styles.checkboxLabel}
                    control={<Checkbox color="primary" size="small" />}
                    label="包含於考勤報表"
                    checked={userDisplaySituationState.isDisplayOnClockInReportList}
                    onChange={() => handleUserIdentityChange('isDisplayOnClockInReportList')}
                />
            </div>
        </div>
    )
}

PermissionSettings.propTypes = {
    userDisplaySituationState: PropTypes.object.isRequired,
    setUserDisplaySituationState: PropTypes.func.isRequired,
}

export default PermissionSettings
