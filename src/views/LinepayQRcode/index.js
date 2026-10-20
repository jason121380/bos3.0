import Page from 'components/Page'
import QRCode from 'qrcode'

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
    <Page className="min-w-[275px] p-8" title="Reservation">
      <div className="absolute left-[50%] top-[25%] [transform:translate(-50%,-50%)]">掃碼支付 Line Pay</div>
      <div
        className="fixed left-[50%] top-[50%] h-[300px] w-[300px] text-center [transform:translate(-50%,-50%)]"
        dangerouslySetInnerHTML={{
          __html: code,
        }}
      />
      {/* http://localhost:3000/pad/linepay/{match.params.url} */}
    </Page>
  )
}
