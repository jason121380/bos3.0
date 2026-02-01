/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  formControl: css({
    marginBottom: theme.spacing(3),
    width: '100%',
    '&:last-child': {
      marginBottom: 0,
    },
  }),
  cardHeader: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
}

function AboutAuthority({
  className,
  userAuthorityName,
  setUserAuthorityName,
  authoritySettings,
  setAuthoritySettings,
  onChange,
  ...rest
}) {
  const handleChangeAuthority = (authority, index1, index2) => {
    const newAuthoritySettings = _.cloneDeep(authoritySettings)
    const insideAuthFalseCounter = []
    newAuthoritySettings[index1].pageAuthority.forEach((data, dataIndex) => {
      if (index2 === dataIndex) {
        data.authority = !authority
      }
      if (!data.authority) {
        insideAuthFalseCounter.push(data)
      }
    })
    if (insideAuthFalseCounter.length === newAuthoritySettings[index1].pageAuthority.length) {
      newAuthoritySettings[index1].authority = false
    } else {
      newAuthoritySettings[index1].authority = true
    }
    setAuthoritySettings(newAuthoritySettings)
  }

  const handleClickAll = (authority, index1) => {
    const newAuthoritySettings = _.cloneDeep(authoritySettings)
    if (!authority) {
      newAuthoritySettings.forEach((data, dataIndex) => {
        if (index1 === dataIndex) {
          data.authority = true
          data.pageAuthority.forEach(data2 => {
            data2.authority = true
          })
        }
      })
      setAuthoritySettings(newAuthoritySettings)
    } else {
      newAuthoritySettings.forEach((data, dataIndex) => {
        if (index1 === dataIndex) {
          data.authority = false
          data.pageAuthority.forEach(data2 => {
            data2.authority = false
          })
        }
      })
      setAuthoritySettings(newAuthoritySettings)
    }
  }
  return (
    <Fragment>
      <Card {...rest} css={className}>
        <CardHeader title="一般資訊" />
        <CardContent>
          <TextField
            css={styles.formControl}
            value={userAuthorityName}
            label="名稱"
            variant="outlined"
            fullWidth
            onChange={event => setUserAuthorityName(event.target.value)}
          />
        </CardContent>
      </Card>
      {authoritySettings.map((item, index1) => (
        <Card {...rest} style={{ marginTop: '20px' }} key={index1}>
          <div css={styles.cardHeader}>
            <div>
              <CardHeader title={item.pageTitle} />
            </div>
            <div>
              <Button
                color="primary"
                variant="contained"
                style={{ marginRight: '20px' }}
                onClick={() => handleClickAll(item.authority, index1)}
              >
                全選/取消全選
              </Button>
            </div>
          </div>
          <Divider />
          <CardContent>
            {item.pageAuthority.map((setting, index2) => (
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label={setting.pageName}
                checked={setting.authority}
                onChange={() => handleChangeAuthority(setting.authority, index1, index2)}
                key={setting.pageName}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </Fragment>
  )
}

AboutAuthority.propTypes = {
  className: PropTypes.object,
}

export default AboutAuthority
