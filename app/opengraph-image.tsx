import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Shit That Never Happened'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020817',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
          gap: 24,
        }}
      >
        <div style={{ fontSize: 96, color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>💩</span>
          <span style={{ fontWeight: 700 }}>STNH</span>
        </div>
        <div style={{ fontSize: 32, color: '#64748b' }}>
          A collection of fabricated stories from social media
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 