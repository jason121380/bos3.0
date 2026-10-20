const liff = typeof window === 'undefined' ? null : window.liff
let isInit = false
let profile = {}
const liffInfo = {}

class LiffHelper {
  init(liffId = '') {
    return new Promise((resolve, reject) => {
      if (!isInit) {
        liff.init(
          {
            liffId: liffId,
          },
          data => {
            isInit = true
            if (!window.liff.isLoggedIn()) {
              liff.login()
              // eslint-disable-next-line prefer-promise-reject-errors
              reject('NOT_LOGIN')
            } else {
              resolve()
            }
          },
          err => {
            console.log('Fail to init LIFF, please run inside LINE only')
            reject(err)
          }
        )
        // liff.isLoggedIn()
      } else {
        resolve()
      }
    })
  }

  getLIFFInfo() {
    return liffInfo
  }

  getProfile(liffId = '') {
    return new Promise((resolve, reject) => {
      this.init(liffId)
        .then(() => {
          if (isInit && !profile.userId) {
            liff
              .getProfile()
              .then(pf => {
                profile = pf
                resolve(profile)
              })
              .catch(err => {
                console.log('get profile error', err)
                reject(err)
              })
          } else {
            resolve(profile)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  closeWindow() {
    liff.closeWindow()
  }

  openWindow(url, external) {
    liff.openWindow({ url, external })
  }

  sendMessages(messages) {
    const messagesToSend = Array.isArray(messages) ? messages : [messages]
    return new Promise((resolve, reject) => {
      this.init()
        .then(() => {
          liff
            .sendMessages(messagesToSend)
            .then(() => {
              resolve()
            })
            .catch(err => {
              reject(err)
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
export default new LiffHelper()
