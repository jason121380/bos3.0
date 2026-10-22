// 保護頭像裁切（Profile/General/CropImage）：旋轉後的外框尺寸、以裁切範圍取出影像並輸出名為 avatar 的 JPEG 檔；
// 影像載入失敗時拒絕；瀏覽器不支援 canvas 2D 時回傳 null（頁面會提示）。jsdom 沒有 canvas 與影像載入，以假物件模擬。
import getCroppedImg, { createImage, getRadianAngle, rotateSize } from '../General/CropImage'

const realImage = window.Image
const realGetContext = window.HTMLCanvasElement.prototype.getContext
const realToBlob = window.HTMLCanvasElement.prototype.toBlob

// 設定 src 後非同步觸發 load（或 error）的假影像
const fakeImage = ({ fail = false, width = 400, height = 200 } = {}) =>
  class FakeImage {
    constructor() {
      this.listeners = {}
      this.width = width
      this.height = height
    }
    addEventListener(type, fn) {
      this.listeners[type] = fn
    }
    set src(url) {
      this._src = url
      setTimeout(() => (fail ? this.listeners.error(new Error('load failed')) : this.listeners.load()), 0)
    }
    get src() {
      return this._src
    }
  }

afterEach(() => {
  window.Image = realImage
  window.HTMLCanvasElement.prototype.getContext = realGetContext
  window.HTMLCanvasElement.prototype.toBlob = realToBlob
})

describe('CropImage', () => {
  it('角度換算與旋轉後外框尺寸', () => {
    expect(getRadianAngle(180)).toBeCloseTo(Math.PI)
    const box = rotateSize(400, 200, 90)
    expect(box.width).toBeCloseTo(200)
    expect(box.height).toBeCloseTo(400)
  })

  it('依裁切範圍取出影像，輸出名為 avatar 的檔案；可左右／上下翻轉', async () => {
    window.Image = fakeImage()
    const ops = []
    const ctx = {
      translate: (...a) => ops.push(['translate', ...a]),
      rotate: r => ops.push(['rotate', r]),
      scale: (...a) => ops.push(['scale', ...a]),
      drawImage: () => ops.push(['drawImage']),
      getImageData: (...a) => {
        ops.push(['getImageData', ...a])
        return 'pixels'
      },
      putImageData: (...a) => ops.push(['putImageData', ...a]),
    }
    window.HTMLCanvasElement.prototype.getContext = () => ctx
    window.HTMLCanvasElement.prototype.toBlob = function toBlob(cb, type) {
      ops.push(['toBlob', type, this.width, this.height])
      cb(new Blob(['jpg']))
    }
    const file = await getCroppedImg('data:image/png;base64,xx', { x: 10, y: 20, width: 100, height: 120 }, 0, { horizontal: true, vertical: true })
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('avatar')
    expect(ops).toContainEqual(['scale', -1, -1])
    expect(ops).toContainEqual(['getImageData', 10, 20, 100, 120])
    expect(ops).toContainEqual(['putImageData', 'pixels', 0, 0])
    expect(ops).toContainEqual(['toBlob', 'image/jpeg', 100, 120])
    // 預設不翻轉、不旋轉
    ops.length = 0
    await getCroppedImg('data:image/png;base64,xx', { x: 0, y: 0, width: 10, height: 10 })
    expect(ops).toContainEqual(['scale', 1, 1])
    expect(ops).toContainEqual(['rotate', 0])
  })

  it('瀏覽器不支援 canvas 2D 時回傳 null；影像載入失敗時拒絕', async () => {
    window.Image = fakeImage()
    window.HTMLCanvasElement.prototype.getContext = () => null
    await expect(getCroppedImg('x', { x: 0, y: 0, width: 1, height: 1 })).resolves.toBeNull()
    window.Image = fakeImage({ fail: true })
    await expect(createImage('broken')).rejects.toThrow('load failed')
  })
})
