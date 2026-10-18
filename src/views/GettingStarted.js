import Markdown from 'components/Markdown'
import Page from 'components/Page'
import { useEffect, useState } from 'react'
import { PageHeader } from 'ui/page-header'

function GettingStarted() {
  const [source, setSource] = useState('')

  useEffect(() => {
    fetch('/docs/GettingStarted.md')
      .then(response => response.text())
      .then(text => setSource(text))
  }, [])

  return (
    <Page className="ui-root" title="Getting Started">
      <PageHeader title="Getting Started" />
      {source && (
        <div className="max-w-3xl">
          <Markdown escapeHtml={false} source={source} />
        </div>
      )}
    </Page>
  )
}

export default GettingStarted
