/** @jsxImportSource @emotion/react */
import { Button, TextField, colors } from '@mui/material'
import useFetchRegister from 'hooks/useFetchRegister'
import { useRef } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'
const styles = {
  root: css({}),
  fields: css({
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1),
    },
  }),
  submitButton: css({
    marginTop: theme.spacing(2),
    width: '100%',
  }),
}

function RegisterForm({ className, ...rest }) {
  const fetchRegister = useFetchRegister()
  const signup = fetchRegister.register
  const history = useHistory()

  const cellphoneRef = useRef()

  const { register, handleSubmit, errors } = useForm()

  const onSubmit = data => {
    signup(data)
      .then(() => history.push('/auth/login'))
      .catch(cellphoneRef.current.focus)
  }

  return (
    <form {...rest} css={css([styles.root, className])} onSubmit={handleSubmit(onSubmit)}>
      <div css={styles.fields}>
        <TextField
          fullWidth
          label="電話號碼"
          name="cellphone"
          variant="outlined"
          error={!!errors.cellphone}
          helperText={errors.cellphone && errors.cellphone.message}
          inputProps={{
            'data-testid': 'cellphone',
            ref: e => {
              cellphoneRef.current = e
              register(e, {
                required: '電話號碼為必填',
                minLength: {
                  value: 10,
                  message: '電話號碼最少為 10 碼',
                },
                maxLength: {
                  value: 13,
                  message: '電話號碼最多為 13 碼',
                },
              })
            },
          }}
        />
      </div>
      <ThemeProvider theme={theme}>
        <Button
          css={styles.submitButton}
          color='primary'
          size="large"
          type="submit"
          variant="contained"
          data-testid="submit"
        >
          註冊
        </Button>
      </ThemeProvider>
    </form>
  )
}

export default RegisterForm
