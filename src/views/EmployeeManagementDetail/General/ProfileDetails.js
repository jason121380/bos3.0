/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material'
import idx from 'idx'
import PropTypes from 'prop-types'
import React from 'react'
import { css } from '@emotion/react'

const styles = {
  root: css({
    borderRadius: '24px',
    boxShadow: 'none',
    border: 'none',
    overflow: 'hidden',
  }),
  content: css({
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    gap: '20px',
  }),
  avatar: css({
    height: 80,
    width: 80,
    border: 'none',
    boxShadow: 'none',
    flexShrink: 0,
  }),
  infoGroup: css({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  }),
  name: css({
    fontWeight: 'bold !important',
    color: 'rgb(var(--text))',
    fontSize: '18px !important',
    margin: '0 !important',
    whiteSpace: 'nowrap',
  }),
  role: css({
    color: 'rgb(var(--text-secondary))',
    fontWeight: 500,
    fontSize: '13px',
    margin: '0 !important',
    whiteSpace: 'nowrap',
  }),
  jobTitle: css({
    color: '#80868B',
    fontSize: '12px',
    margin: '0 !important',
    whiteSpace: 'nowrap',
  }),
  lineStatus: (isBinded) => css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '16px',
    backgroundColor: isBinded ? '#E8F5E9' : 'rgb(var(--surface))',
    whiteSpace: 'nowrap',
  }),
  lineIcon: css({
    width: '16px',
    height: '16px',
  }),
  lineText: (isBinded) => css({
    fontSize: '12px',
    fontWeight: 600,
    color: isBinded ? 'rgb(var(--success))' : 'rgb(var(--text-secondary))',
  }),
  buttonContainer: css({
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  }),
  resignButton: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontWeight: '600 !important',
    fontSize: '13px !important',
    textTransform: 'none !important',
    boxShadow: 'none !important',
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    border: 'none !important',
    '&:hover': {
      backgroundColor: '#E8EAED !important',
      boxShadow: 'none !important',
    },
  }),
  saveButton: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontWeight: '600 !important',
    fontSize: '13px !important',
    textTransform: 'none !important',
    boxShadow: 'none !important',
    backgroundColor: 'rgb(var(--accent)) !important',
    color: '#FFFFFF !important',
    border: 'none !important',
    '&:hover': {
      backgroundColor: '#1557B0 !important',
      boxShadow: 'none !important',
    },
  }),
  settingsSection: css({
    padding: '0 24px 32px 24px',
  }),
  settingsTitle: css({
    fontSize: '15px',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
    marginBottom: '16px',
    paddingLeft: '8px',
    borderLeft: '4px solid rgb(var(--accent))',
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
    '& .MuiTypography-root': {
      fontSize: '14.5px',
      color: 'rgb(var(--text))',
    }
  }),
}

function ProfileDetails({
  profile,
  avatar,
  isLineBinded,
  merchantIdentity,
  onEmployeeResign,
  onSubmit,
  ...rest
}) {
  return (
    <Card css={styles.root}>
      <CardContent sx={{ padding: '0 !important' }}>
        <div css={styles.content}>
          <Avatar
            css={styles.avatar}
            src={profile.avatar}
          />
          <div css={styles.infoGroup}>
            <Typography css={styles.name} variant="h3">
              {idx(profile, _ => _.firstName + ' ' + _.lastName)}
            </Typography>
            <Typography css={styles.role} variant="body1">
              {merchantIdentity.authorityName.length > 0
                ? merchantIdentity.authorityName
                : '權限未設定'}
            </Typography>
            <Typography css={styles.jobTitle} variant="body2">
              {idx(profile, _ => _.jobTitle || '-')}
            </Typography>
            <div css={styles.lineStatus(isLineBinded)}>
              <img
                css={styles.lineIcon}
                alt="line"
                src={require(`assets/images/${isLineBinded ? 'LINE_APP' : 'LINE_BLACK_LOGO'}.png`)}
                style={isLineBinded ? {} : { opacity: 0.4 }}
              />
              <span css={styles.lineText(isLineBinded)}>
                {isLineBinded ? 'LINE 已綁定' : 'LINE 未綁定'}
              </span>
            </div>
          </div>
          <div css={styles.buttonContainer}>
            <Button
              css={styles.resignButton}
              variant="contained"
              onClick={onEmployeeResign}
            >
              辦理員工離職
            </Button>
            <Button
              css={styles.saveButton}
              variant="contained"
              onClick={onSubmit}
            >
              儲存
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

ProfileDetails.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default ProfileDetails
