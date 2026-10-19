import React from 'react'
import PropTypes from 'prop-types'
// 數字輸入改用 Field＋Input，保留 onWheel 失焦與原有數值處理
import { CheckboxField } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
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
                    <Field label="同時段預約人數上限">
                        <Input
                            className="w-full"
                            type="number"
                            name="bookingLimit"
                            placeholder="例如: 3"
                            onChange={event =>
                                handleBookingLimit(
                                    idx(event, _ => ({ value: parseInt(_.target.value), key: _.target.name }))
                                )
                            }
                            value={bookingLimitInput.bookingLimit !== null ? bookingLimitInput.bookingLimit : 3}
                            onWheel={() => document.activeElement.blur()}
                        />
                    </Field>
                </div>
                <div>
                    <Field label='預約審核模式'>
                        <NativeSelect
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
                    </Field>
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
