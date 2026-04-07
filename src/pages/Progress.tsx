import { useState, useEffect, useCallback, useRef } from 'react'
import { useApi } from '../hooks/useApi'
import { motion, AnimatePresence } from 'framer-motion'

interface ProgressPhoto {
  id: number
  date: string
  imageUrl: string
  note?: string
  weight?: number
}

export default function Progress() {
  const { fetchWithAuth } = useApi()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareIndex, setCompareIndex] = useState(0)
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0])
  const [uploadNote, setUploadNote] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const loadPhotos = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/Progress')
      setPhotos(data)
    } catch (error) {
      console.error('Failed to load photos:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadDate(new Date().toISOString().split('T')[0])
    setUploadNote('')
    setShowUploadModal(true)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleUpload() {
    if (!pendingFile) return

    setUploading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(pendingFile)
      })

      await fetchWithAuth('/api/Progress', {
        method: 'POST',
        body: JSON.stringify({
          date: new Date(uploadDate).toISOString(),
          base64Image: base64,
          note: uploadNote || null,
        }),
      })

      setShowUploadModal(false)
      setPendingFile(null)
      setPreviewUrl(null)
      await loadPhotos()
    } catch (error) {
      console.error('Failed to upload:', error)
    } finally {
      setUploading(false)
    }
  }

  function cancelUpload() {
    setShowUploadModal(false)
    setPendingFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetchWithAuth(`/api/Progress/${id}`, { method: 'DELETE' })
      setSelectedPhoto(null)
      await loadPhotos()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen -m-4">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="mb-6 pt-4 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white text-shadow">PROGRESS</h1>
            <p className="text-slate-400 text-shadow-sm">Your transformation</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
          >
            + Add
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Compare Mode Toggle */}
        {photos.length >= 2 && (
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`w-full mb-4 py-3 rounded-2xl font-medium transition-colors ${
              compareMode
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            {compareMode ? 'Exit Compare' : ' Compare Photos'}
          </button>
        )}

        {/* Compare View */}
        {compareMode && photos.length >= 2 && (
          <div className="bg-white rounded-3xl p-4 shadow-lg mb-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="relative">
                <img
                  src={photos[photos.length - 1].imageUrl}
                  alt="First"
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {new Date(photos[photos.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {photos[photos.length - 1].weight && ` • ${photos[photos.length - 1].weight}kg`}
                </div>
              </div>
              <div className="relative">
                <img
                  src={photos[compareIndex].imageUrl}
                  alt="Current"
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {new Date(photos[compareIndex].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {photos[compareIndex].weight && ` • ${photos[compareIndex].weight}kg`}
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={photos.length - 1}
              value={compareIndex}
              onChange={(e) => setCompareIndex(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-center text-slate-400 text-sm mt-2">
              Slide to compare progress
            </p>
          </div>
        )}

        {/* Photo Feed */}
        {!compareMode && (
        <>
            {photos.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                </div>
                <p className="text-white/70 font-medium mb-2">No progress photos yet</p>
                <p className="text-white/40 text-sm">Take your first photo to start tracking your transformation</p>
            </div>
            ) : (
            <div className="space-y-4">
                {photos.map((photo) => (
                <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="w-full bg-white rounded-3xl overflow-hidden shadow-lg text-left"
                >
                    <img
                    src={photo.imageUrl}
                    alt="Progress"
                    className="w-full aspect-[4/5] object-cover"
                    />
                    <div className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-bold text-slate-900">
                        {new Date(photo.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                        </p>
                        {photo.note && (
                        <p className="text-slate-500 text-sm">{photo.note}</p>
                        )}
                    </div>
                    {photo.weight && (
                        <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                        {photo.weight} kg
                        </div>
                    )}
                    </div>
                </button>
                ))}
            </div>
            )}
        </>
        )}

            {/* Upload Modal */}
            <AnimatePresence>
            {showUploadModal && (
                <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={cancelUpload}
                />
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed left-4 right-4 top-20 bottom-24 bg-white rounded-3xl shadow-xl z-50 flex flex-col overflow-hidden"
                >
                    <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-xl font-bold text-slate-900">Add Photo</h2>
                    <button
                        onClick={cancelUpload}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
                    >
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {previewUrl && (
                        <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-2xl mb-4 bg-slate-100"
                        />
                    )}

                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm text-slate-500 mb-1">Date</label>
                        <input
                            type="date"
                            value={uploadDate}
                            onChange={(e) => setUploadDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                        />
                        </div>

                        <div>
                        <label className="block text-sm text-slate-500 mb-1">Note (optional)</label>
                        <input
                            type="text"
                            value={uploadNote}
                            onChange={(e) => setUploadNote(e.target.value)}
                            placeholder="e.g. Week 4, feeling stronger!"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                        />
                        </div>
                    </div>
                    </div>

                    <div className="p-6 pt-0">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                    >
                        {uploading ? 'Uploading...' : 'Save Photo'}
                    </button>
                    </div>
                </motion.div>
                </>
            )}
            </AnimatePresence>

            {/* Photo Detail Modal */}
            <AnimatePresence>
            {selectedPhoto && (
                <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black z-40"
                    onClick={() => setSelectedPhoto(null)}
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-black/50">
                    <div className="text-white">
                        <p className="font-bold">
                        {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                        </p>
                        {selectedPhoto.weight && (
                        <p className="text-white/70">{selectedPhoto.weight} kg</p>
                        )}
                    </div>
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>

                    {/* Image - Full width like Instagram */}
                    <div className="flex-1 flex items-center bg-black">
                    <img
                        src={selectedPhoto.imageUrl}
                        alt="Progress"
                        className="w-full max-h-full object-contain"
                    />
                    </div>

                    {/* Note if exists */}
                    {selectedPhoto.note && (
                    <div className="p-4 bg-black/50">
                        <p className="text-white/70">{selectedPhoto.note}</p>
                    </div>
                    )}

                    {/* Delete button - fixed at bottom */}
                    <div className="p-4 pb-24 bg-black">
                    <button
                        onClick={() => handleDelete(selectedPhoto.id)}
                        className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-medium border border-red-500/30"
                    >
                        Delete Photo
                    </button>
                    </div>
                </motion.div>
                </>
            )}
            </AnimatePresence>
      </div>
    </div>
  )
}