import { useState } from 'react'
import NumberPicker from './NumberPicker'

interface OnboardingProps {
  onComplete: (data: {
    gender: string
    weight: number
    height: number
    age: number
    goal: string
  }) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [gender, setGender] = useState('')
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [age, setAge] = useState(25)
  const [goal, setGoal] = useState('')

  function nextStep() {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onComplete({ gender, weight, height, age, goal })
    }
  }

  function prevStep() {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  function canContinue() {
    switch (step) {
      case 1: return gender !== ''
      case 2: return weight > 0
      case 3: return height > 0
      case 4: return age > 0
      case 5: return goal !== ''
      default: return false
    }
  }

  return (
    <div style={{ height: '100dvh' }} className="bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {step > 1 ? (
          <button onClick={prevStep} className="text-zinc-400 hover:text-white">
            ← Back
          </button>
        ) : (
          <div />
        )}
        <span className="text-zinc-500">{step}/{totalSteps}</span>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4">
        <div className="h-1 bg-zinc-800 rounded-full">
          <div
            className="h-1 bg-indigo-500 rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-hidden flex flex-col">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Introduce Yourself</h1>
            <p className="text-zinc-400 mb-6">To give you a better experience, we need to know your gender.</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGender('male')}
                className={`w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  gender === 'male' ? 'border-indigo-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <span className="text-3xl">👨</span>
                <span>Male</span>
              </button>
              <button
                onClick={() => setGender('female')}
                className={`w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  gender === 'female' ? 'border-indigo-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <span className="text-3xl">👩</span>
                <span>Female</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
        <div>
            <h1 className="text-2xl font-bold mb-2">What's Your Weight?</h1>
            <p className="text-zinc-400 mb-4">Weight in kg, feel free to adjust it later.</p>
            <NumberPicker value={weight} onChange={setWeight} min={30} max={200} step={0.5} unit="kg" />
        </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">What's Your Height?</h1>
            <p className="text-zinc-400 mb-4">Height in cm, you can always change it later.</p>
            <NumberPicker value={height} onChange={setHeight} min={100} max={220} step={1} unit="cm" />
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">How Old Are You?</h1>
            <p className="text-zinc-400 mb-4">This helps us personalize your experience.</p>
            <NumberPicker value={age} onChange={setAge} min={13} max={100} step={1} unit="years" />
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">What's Your Goal?</h1>
            <p className="text-zinc-400 mb-4">This helps us tailor your journey.</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setGoal('lose')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  goal === 'lose' ? 'border-indigo-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <span className="font-medium">Lose Weight</span>
              </button>
              <button
                onClick={() => setGoal('maintain')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  goal === 'maintain' ? 'border-indigo-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <span className="font-medium">Maintain Weight</span>
              </button>
              <button
                onClick={() => setGoal('gain')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  goal === 'gain' ? 'border-indigo-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <span className="font-medium">Gain Weight</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="p-4">
        <button
          onClick={nextStep}
          disabled={!canContinue()}
          className="w-full py-4 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === totalSteps ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}