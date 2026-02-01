/** @jsxImportSource @emotion/react */
import Page from 'components/Page'
import QRCode from 'qrcode'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const StyledQrcode = styled.div`
  width: 300px;
  height: 300px;
  text-align: center;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const StyledTips = styled.div`
  position: absolute;
  left: 50%;
  top: 25%;
  transform: translate(-50%, -50%);
`

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
  }),
  bullet: css({
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  }),
  title: css({
    fontSize: 14,
  }),
  pos: css({
    marginBottom: 12,
  }),
}
export default function Reservation({ match }) {
  // const history = useHistory()
  let code = null

  // React.useEffect(() => {
  //   // const socket = io('http://localhost:4849')
  //   const socket = io('https://apibeautyos.mlgroup.vip')
  //   global.mlg_socket = socket
  //   global.mlg_socket.on('connect', () => {
  //     const pairId = localStorage.getItem('pairId')
  //     socket.emit('SET', {
  //       device: 'PC',
  //       pairId: pairId
  //     })
  //     socket.on('RCVD', data => {
  //       const { type } = data
  //       console.log(type)
  //       switch (type) {
  //         case 'SHOW_RATING':
  //           history.push(`/pad/rating`)
  //           break
  //         default:
  //           break
  //       }
  //     })
  //   })
  // }, [])

  // QRCode.toString(`http://localhost:3000/pad/linepay/${match.params.url}`, { type: 'terminal' }, (_err, url) => (code = url))
  QRCode.toString(
    `${Buffer.from(match.params.url, 'base64').toString()}`,
    // `http://localhost:4849/pad/linepay/${match.params.url}`,
    { type: 'terminal' },
    (_err, url) => (code = url)
  )
  return (
    <Page css={styles.root} title="Reservation">
      <StyledTips>掃碼支付 Line Pay</StyledTips>
      <StyledQrcode
        dangerouslySetInnerHTML={{
          __html: code,
        }}
      />
      {/* http://localhost:3000/pad/linepay/{match.params.url} */}
    </Page>
  )
}
