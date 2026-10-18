import React from 'react'
import PropTypes from 'prop-types'
// 數字輸入（onWheel 失焦）保留 MUI TextField
import { TextField } from '@mui/material'
import { CheckboxField } from 'ui/checkbox'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import idx from 'idx'

function MobileBookingSettings({
    profile,
    onChange,
    bookingLimitInput,
    handleBookingLimit,
    ...rest
}) {
    return (
        <div {...rest}>
            <h3 className="mb-4 text-heading text-text">
                手機端預約設定
            </h3>
            <div className="flex flex-col gap-4">
                <div>
                    <TextField
                        fullWidth
                        label="同時段預約人數上限"
                        type="number"
                        name="bookingLimit"
                        placeholder="例如: 3"
                        onChange={event =>
                            handleBookingLimit(
                                idx(event, _ => ({ value: parseInt(_.target.value), key: _.target.name }))
                            )
                        }
                        value={bookingLimitInput.bookingLimit !== null ? bookingLimitInput.bookingLimit : 3}
                        variant="outlined"
                        onWheel={() => document.activeElement.blur()}
                    />
                </div>
                <div>
                    <NativeSelect
                        label='預約審核模式'
                        value={profile.isBookingAutoAccept}
                        onChange={event =>
                            onChange({
                                value: idx(event, _ => _.target.value),
                                key: 'isBookingAutoAccept',
                            })
                        }
                    >
                        <NativeSelectOption value="TRUE">自動開啟</NativeSelectOption>
                        <NativeSelectOption value="FALSE">手動關閉</NativeSelectOption>
                        <NativeSelectOption value="BYSTORE">依店家系統設定</NativeSelectOption>
                    </NativeSelect>
                </div>
                <div>
                    <CheckboxField
                        className="m-0 w-full rounded-md bg-surface px-3 py-2"
                        label="待審核預約是否占用預約名額"
                        checked={profile.isRTCO}
                        onChange={event =>
                            onChange({
                                value: !profile.isRTCO,
                                key: 'isRTCO',
                            })
                        }
                    />
                </div>
            </div>
        </div>
    )
}

MobileBookingSettings.propTypes = {
    profile: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    bookingLimitInput: PropTypes.object.isRequired,
    handleBookingLimit: PropTypes.func.isRequired,
}

export default MobileBookingSettings
