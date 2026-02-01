/** @jsxImportSource @emotion/react */
import { Container, Divider, Typography, colors } from '@mui/material'
import Markdown from 'components/Markdown'
import Page from 'components/Page'
import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  divider: css({
    backgroundColor: colors.grey[300],
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  }),
  markdownContainer: css({
    marginLeft: 0,
    marginRight: 0,
  }),
}

function GettingStarted() {
  const [source, setSource] = useState('')

  useEffect(() => {
    fetch('/docs/GettingStarted.md')
      .then(response => response.text())
      .then(text => setSource(text))
  }, [])

  return (
    <Page css={styles.root} title="Getting Started">
      <Container maxWidth={false}>
        <Typography gutterBottom variant="overline">
          Development
        </Typography>
        <Typography variant="h3">Getting Started</Typography>
        <Divider css={styles.divider} />
      </Container>
      {source && (
        <Container maxWidth="md" css={styles.markdownContainer}>
          <Markdown escapeHtml={false} source={source} />
        </Container>
      )}
    </Page>
  )
}

export default GettingStarted
