/** @jsxImportSource @emotion/react */
import React from 'react'
import PropTypes from 'prop-types'
import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from '@mui/material'
import { css } from '@emotion/react'
import idx from 'idx'

const styles = {
    root: css({
        borderRadius: '24px',
        boxShadow: 'none',
        border: 'none',
    }),
}

function MobileBookingSettings({
    profile,
    onChange,
    bookingLimitInput,
    handleBookingLimit,
    ...rest
}) {
    return (
        <div {...rest}>
            <div css={css({
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'rgb(var(--text))',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            })}>
                <div css={css({
                    width: '4px',
                    height: '18px',
                    backgroundColor: 'rgb(var(--accent))',
                    borderRadius: '2px',
                })} />
                手機端預約設定
            </div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>預約審核模式</InputLabel>
                        <Select
                            label='預約審核模式'
                            value={profile.isBookingAutoAccept}
                            onChange={event =>
                                onChange({
                                    value: idx(event, _ => _.target.value),
                                    key: 'isBookingAutoAccept',
                                })
                            }
                        >
                            <MenuItem value="TRUE">自動開啟</MenuItem>
                            <MenuItem value="FALSE">手動關閉</MenuItem>
                            <MenuItem value="BYSTORE">依店家系統設定</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        sx={{
                            backgroundColor: 'rgb(var(--surface))',
                            width: '100%',
                            margin: 0,
                            padding: '8px 12px',
                            borderRadius: '12px',
                            '& .MuiTypography-root': { fontSize: '14px', color: 'rgb(var(--text-secondary))' }
                        }}
                        label="待審核預約是否占用預約名額"
                        checked={profile.isRTCO}
                        onChange={event =>
                            onChange({
                                value: !profile.isRTCO,
                                key: 'isRTCO',
                            })
                        }
                    />
                </Grid>
            </Grid>
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
