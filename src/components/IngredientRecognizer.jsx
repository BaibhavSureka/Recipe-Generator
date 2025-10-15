import { useRef, useState, useEffect } from "react"
import { toCanonical } from "../lib/synonyms.js"

export default function IngredientRecognizer({ onRecognized }) {
  const [imageURL, setImageURL] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [predictions, setPredictions] = useState([])
  const [modelReady, setModelReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Check if TensorFlow and MobileNet are loaded
    const checkModels = () => {
      if (typeof window !== 'undefined' && window.tf && window.mobilenet) {
        console.log('✅ TensorFlow.js and MobileNet loaded successfully')
        setModelReady(true)
        setLoadingProgress(100)
      } else {
        console.log('⏳ Waiting for AI models to load...', { tf: !!window.tf, mobilenet: !!window.mobilenet })
        setLoadingProgress((prev) => Math.min(prev + 10, 95))
        setTimeout(checkModels, 150)
      }
    }
    
    // Start checking immediately for faster feedback
    checkModels()
  }, [])

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file")
      return
    }
    const url = URL.createObjectURL(file)
    setImageURL(url)
    setPredictions([])
    setError("")
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const analyze = async () => {
    if (!imageURL || !imgRef.current) return
    
    try {
      setLoading(true)
      setError("")
      
      // Double-check if TensorFlow.js and MobileNet are available
      if (typeof window === 'undefined' || !window.tf || !window.mobilenet) {
        setError("AI model is still loading. Please wait a moment and try again.")
        setLoading(false)
        return
      }
      
      console.log('🔍 Starting fast image analysis with MobileNet...')
      
      // Load MobileNet v2 (lightweight version 0.5, super fast!)
      const net = await window.mobilenet.load({ version: 2, alpha: 0.5 })
      console.log('✅ MobileNet model loaded (lightweight version)')
      
      const predictions = await net.classify(imgRef.current, 5)
      console.log('✅ Classification results:', predictions)
      
      // Extract ingredient names and map to canonical forms
      const ingredients = predictions
        .map((p) => toCanonical(p.className))
        .filter(Boolean)
      
      setPredictions(predictions)
      onRecognized([...new Set(ingredients)])
    } catch (e) {
      console.error("Image recognition error:", e)
      setError("Couldn't identify ingredients — try a clearer photo or add items manually.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-border hover:border-primary/50 bg-card'
        } ${imageURL ? 'min-h-[280px]' : 'min-h-[200px]'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!imageURL ? (
          <>
            <div className="text-6xl mb-2">📷</div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Drag & drop a photo of your ingredients here, or{" "}
              <label className="text-primary font-semibold cursor-pointer underline hover:text-primary-dark transition">
                browse files
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">Supports: JPG, PNG, WebP</p>
          </>
        ) : (
          <div className="w-full">
            <img
              ref={imgRef}
              src={imageURL}
              alt="Uploaded ingredients"
              className="max-h-64 mx-auto rounded-lg object-contain shadow-md"
              crossOrigin="anonymous"
            />
            <button
              onClick={() => {
                setImageURL(null)
                setPredictions([])
                setError("")
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="mt-3 text-sm text-muted-foreground hover:text-destructive transition"
            >
              ✕ Remove image
            </button>
          </div>
        )}
      </div>

      {!modelReady && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin text-2xl">⚡</div>
            <span className="text-sm font-medium">Loading Fast AI Model... {loadingProgress}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-200 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">⚡ Lightweight model • ~2MB • Cached after first load</p>
        </div>
      )}

      <button
        type="button"
        onClick={analyze}
        disabled={!imageURL || loading || !modelReady}
        className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:hover:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">🔍</span>
            Analyzing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>✨</span>
            Analyze Image with AI
          </span>
        )}
      </button>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
          ⚠️ {error}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🎯</span>
            <span>Detected Items</span>
          </h3>
          <ul className="space-y-2">
            {predictions.map((p, idx) => (
              <li key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition">
                <span className="font-medium capitalize">{p.className}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${p.probability * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-mono min-w-[3rem] text-right">
                    {(p.probability * 100).toFixed(0)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <span>ℹ️</span>
            <span>Items automatically added to your ingredient list</span>
          </p>
        </div>
      )}
    </div>
  )
}
