'use client'

import { useWizard } from './wizard-context'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'

export function WizardProgress() {
  const { currentStep, totalSteps, STEPS } = useWizard()
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="space-y-2">
      <Progress 
        value={progress} 
        className="h-2"
        // Add smooth transition
        asChild
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </Progress>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{STEPS[currentStep].title}</span>
      </div>
    </div>
  )
} 