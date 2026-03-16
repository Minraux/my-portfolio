// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MediaPlayer({ value }: any) {
  const { file, mediaType } = value
  const fileUrl = typeof file === 'string' ? file : file?.url || file

  if (!fileUrl || !mediaType) {
    return null
  }

  return (
    <div style={{ marginBottom: 40, borderTop: '1px solid #1e1e1e', paddingTop: 40 }}>
      {mediaType === 'audio' ? (
        <audio controls src={fileUrl} style={{ width: '100%' }} />
      ) : (
        <video controls src={fileUrl} style={{ width: '100%' }} />
      )}
    </div>
  )
}
