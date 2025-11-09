import type { NextApiRequest, NextApiResponse } from 'next'
import { createCanvas, loadImage } from 'canvas'

// Fallback JS edge detection (simple Sobel) emulating native C++ pipeline for submission/demo.
function sobelEdgeDetect(imageData: ImageData): ImageData {
  const { data, width, height } = imageData
  const gray = new Uint8ClampedArray(width * height)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    gray[i] = Math.floor(0.299 * r + 0.587 * g + 0.114 * b)
  }
  const out = new Uint8ClampedArray(width * height)
  const gxKernel = [-1,0,1,-2,0,2,-1,0,1]
  const gyKernel = [-1,-2,-1,0,0,0,1,2,1]
  for (let y=1;y<height-1;y++) {
    for (let x=1;x<width-1;x++) {
      let gx=0, gy=0
      let k=0
      for (let ky=-1;ky<=1;ky++) {
        for (let kx=-1;kx<=1;kx++) {
          const px = x + kx
          const py = y + ky
          const val = gray[py*width+px]
          gx += val * gxKernel[k]
          gy += val * gyKernel[k]
          k++
        }
      }
  const mag = Math.min(255, Math.floor(Math.sqrt(gx*gx + gy*gy)))
      out[y*width+x] = mag
    }
  }
  const edgeData = new Uint8ClampedArray(width * height * 4)
  for (let i=0;i<width*height;i++) {
    const v = out[i]
    edgeData[i*4] = v
    edgeData[i*4+1] = v
    edgeData[i*4+2] = v
    edgeData[i*4+3] = 255
  }
  return new ImageData(edgeData, width, height)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const { filename, data } = req.body as { filename: string, data: string }
    if (!data) {
      res.status(400).json({ error: 'Missing image data' })
      return
    }
    const buffer = Buffer.from(data, 'base64')
    const img = await loadImage(buffer)
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0,0,img.width,img.height)
    const edges = sobelEdgeDetect(imageData)
    ctx.putImageData(edges,0,0)
    const outBase64 = canvas.toBuffer('image/jpeg').toString('base64')
    res.status(200).json({ data: outBase64, filename: filename.replace(/\.(\w+)$/,'_processed.jpg') })
  } catch (e:any) {
    res.status(500).json({ error: e.message })
  }
}
