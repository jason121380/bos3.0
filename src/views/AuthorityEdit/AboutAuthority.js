import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import _ from 'lodash'

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
      <Card {...rest}>
        <CardHeader>
          <CardTitle>一般資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="名稱">
            <Input
              value={userAuthorityName}
              onChange={event => setUserAuthorityName(event.target.value)}
            />
          </Field>
        </CardContent>
      </Card>
      {authoritySettings.map((item, index1) => (
        <Card {...rest} key={index1}>
          <CardHeader
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleClickAll(item.authority, index1)}
              >
                全選/取消全選
              </Button>
            }
          >
            <CardTitle>{item.pageTitle}</CardTitle>
          </CardHeader>
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
