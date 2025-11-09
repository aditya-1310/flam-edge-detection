import { useState } from 'react'

export default function Home() {
  const [selected, setSelected] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [processed, setProcessed] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setSelected(f ?? null)
    setProcessed(null)
    setError(null)
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const process = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const arrayBuf = await selected.arrayBuffer()
      const base64 = Buffer.from(arrayBuf).toString('base64')
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selected.name, data: base64 })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')
      setProcessed(`data:image/jpeg;base64,${json.data}`)
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{maxWidth: 860, margin: '40px auto', fontFamily: 'system-ui'}}>
      <h1>FLAM Edge Detection (Web Demo)</h1>
      <p>Upload an image. The server will forward it to our C++ pipeline (or fallback stub) and return the processed result.</p>
      <input type="file" accept="image/*" onChange={onFile} />
      <div style={{display:'flex', gap: 24, marginTop: 24}}>
        <div>
          <h3>Original</h3>
          {preview ? <img src={preview} style={{maxWidth: 400}} /> : <div style={{width:400,height:300,background:'#eee'}}/>}
        </div>
        <div>
          <h3>Processed</h3>
          {processed ? <img src={processed} style={{maxWidth: 400}} /> : <div style={{width:400,height:300,background:'#eee'}}/>}
        </div>
      </div>
      <div style={{marginTop: 16}}>
        <button disabled={!selected || loading} onClick={process}>{loading ? 'Processing…' : 'Process on Server'}</button>
      </div>
      {error && <p style={{color:'crimson'}}>{error}</p>}
      <hr style={{margin:'32px 0'}}/>
      <p style={{fontSize:12, color:'#666'}}>Note: In production the API calls a native C++ CLI built from the same OpenCV pipeline. For local demo, we include a safe fallback.</p>
    </main>
  )
}
