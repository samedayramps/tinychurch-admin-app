'use client'

import { useEffect, useRef } from 'react'
import { type Control, useController } from "react-hook-form"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Script from 'next/script'

interface AddressFieldProps {
  name: string
  control: Control<any>
  label?: string
  description?: string
  value?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  onChange?: (value: AddressFieldProps['value']) => void
  readOnly?: boolean
}

export function AddressField({ 
  name, 
  control, 
  label, 
  description, 
  value, 
  onChange, 
  readOnly 
}: AddressFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { field } = useController({
    name,
    control,
    defaultValue: value || {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  })

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          window.dispatchEvent(new Event('google-maps-ready'))
        }}
      />
      <FormItem>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <Input 
            {...field}
            ref={inputRef}
            value={field.value?.street || ''}
            placeholder="Enter your address"
            autoComplete="off"
            readOnly={readOnly}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </>
  )
} 