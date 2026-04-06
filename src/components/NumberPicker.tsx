import { useRef, useState, useEffect, useCallback } from 'react'

interface NumberPickerProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit: string
}

export default function NumberPicker({ value, onChange, min, max, step = 1, unit }: NumberPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startValue, setStartValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const range = max - min

  function handleStart(clientX: number) {
    setIsDragging(true)
    setStartX(clientX)
    setStartValue(value)
  }

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const deltaX = startX - clientX
    const deltaValue = (deltaX / containerWidth) * (range / 2)
    const newValue = Math.round((startValue + deltaValue) / step) * step
    const clampedValue = Math.max(min, Math.min(max, newValue))

    onChange(clampedValue)
  }, [startX, startValue, range, step, min, max, onChange])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    function onMouseMove(e: MouseEvent) {
      handleMove(e.clientX)
    }

    function onMouseUp() {
      handleEnd()
    }

    function onTouchMove(e: TouchEvent) {
      handleMove(e.touches[0].clientX)
    }

    function onTouchEnd() {
      handleEnd()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  function handleValueClick() {
    setInputValue(step < 1 ? value.toFixed(1) : value.toString())
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleInputBlur() {
    const parsed = parseFloat(inputValue)
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed))
      const rounded = Math.round(clamped / step) * step
      onChange(rounded)
    }
    setIsEditing(false)
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleInputBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  // Generate tick marks
  const ticks = []
  const visibleRange = 40
  const tickStart = Math.max(min, value - visibleRange / 2)
  const tickEnd = Math.min(max, value + visibleRange / 2)

  for (let i = tickStart; i <= tickEnd; i += step) {
    const offset = ((i - value) / (visibleRange / 2)) * 50
    const isMajor = step < 1 ? i % 5 === 0 : i % 10 === 0
    ticks.push(
      <div
        key={i}
        className="absolute flex flex-col items-center"
        style={{ left: `calc(50% + ${offset}%)`, transform: 'translateX(-50%)' }}
      >
        <div className={`w-0.5 ${isMajor ? 'h-6 bg-zinc-400' : 'h-3 bg-zinc-600'}`} />
        {isMajor && (
          <span className="text-xs text-zinc-500 mt-1">{i}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="text-6xl font-bold mb-2 bg-transparent text-center w-32 outline-none border-b-2 border-indigo-500"
          step={step}
          min={min}
          max={max}
        />
      ) : (
        <button
          onClick={handleValueClick}
          className="text-6xl font-bold mb-2 hover:text-indigo-400 transition-colors"
        >
          {step < 1 ? value.toFixed(1) : value}
        </button>
      )}
      <div className="text-zinc-400 mb-6">{unit}</div>

      <div
        ref={containerRef}
        className="relative w-full h-16 cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        {/* Center indicator */}
        <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-indigo-500 -translate-x-1/2 z-10" />

        {/* Ticks */}
        <div className="relative h-full">
          {ticks}
        </div>
      </div>
    </div>
  )
}