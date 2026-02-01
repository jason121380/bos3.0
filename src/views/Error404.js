/** @jsxImportSource @emotion/react */
import { Button, Typography, useMediaQuery } from '@mui/material'
import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    padding: theme.spacing(3),
    paddingTop: '10vh',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
  }),
  imageContainer: css({
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
  }),
  image: css({
    maxWidth: '100%',
    width: 560,
    maxHeight: 300,
    height: 'auto',
  }),
  buttonContainer: css({
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
  }),
}

function Error404() {
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Page css={styles.root} title="Error 404">
      <Typography align="center" variant={mobileDevice ? 'h4' : 'h1'}>
        404: The page you are looking for isn’t here
      </Typography>
      <Typography align="center" variant="subtitle2">
        You either tried some shady route or you came here by mistake. Whichever it is, try using
        the navigation
      </Typography>
      <div css={styles.imageContainer}>
        <img
          alt="Under development"
          css={styles.image}
          src="/images/undraw_page_not_found_su7k.svg"
        />
      </div>
      <div css={styles.buttonContainer}>
        <Button color="primary" component={RouterLink} to="/" variant="outlined">
          Back to home
        </Button>
      </div>
    </Page>
  )
}

export default Error404
