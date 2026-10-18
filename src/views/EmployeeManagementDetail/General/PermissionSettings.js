// 勾選項目搭配 FormControlLabel，保留 MUI
import {
    FormControlLabel,
    Checkbox,
} from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'

const checkboxLabelClass = 'm-0 rounded-md px-2 py-1 transition-colors hover:bg-surface'

function PermissionSettings({ userDisplaySituationState, setUserDisplaySituationState }) {
    const handleUserIdentityChange = (key) => {
        setUserDisplaySituationState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }))
    }

    return (
        <div>
            <h3 className="mb-4 text-heading text-text">
                權限設置
            </h3>
            <div className="flex flex-col gap-1">
                <FormControlLabel
                    className={checkboxLabelClass}
                    control={<Checkbox color="primary" size="small" />}
                    label="出現於打單介面"
                    checked={userDisplaySituationState.isDisplayOnServiceList}
                    onChange={() => handleUserIdentityChange('isDisplayOnServiceList')}
                />
                <FormControlLabel
                    className={checkboxLabelClass}
                    control={<Checkbox color="primary" size="small" />}
                    label="出現於預約列表"
                    checked={userDisplaySituationState.isDisplayOnBookingRecord}
                    onChange={() => handleUserIdentityChange('isDisplayOnBookingRecord')}
                />
                <FormControlLabel
                    className={checkboxLabelClass}
                    control={<Checkbox color="primary" size="small" />}
                    label="可接受顧客預約"
                    checked={userDisplaySituationState.isDisplayOnBookingList}
                    onChange={() => handleUserIdentityChange('isDisplayOnBookingList')}
                />
                <FormControlLabel
                    className={checkboxLabelClass}
                    control={<Checkbox color="primary" size="small" />}
                    label="包含於業績報表"
                    checked={userDisplaySituationState.isDisplayOnPerformanceList}
                    onChange={() => handleUserIdentityChange('isDisplayOnPerformanceList')}
                />
                <FormControlLabel
                    className={checkboxLabelClass}
                    control={<Checkbox color="primary" size="small" />}
                    label="包含於薪資報表"
                    checked={userDisplaySituationState.isDisplayOnSalaryReportList}
                    onChange={() => handleUserIdentityChange('isDisplayOnSalaryReportList')}
                />
                <FormControlLabel
                    className={checkboxLabelClass}
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
