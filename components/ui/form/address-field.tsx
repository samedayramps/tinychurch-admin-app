'use client'

import { useEffect, useRef, useState } from 'react'
import { type Control, useFormContext } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Script from 'next/script'

declare global {
  interface Window {
    google: typeof google;
  }
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface AddressFieldProps {
  control: Control<any>
  name: string
  label?: string
  description?: string
}

export function AddressField({ 
  control, 
  name,
  label = "Address",
  description
}: AddressFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const form = useFormContext()

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !inputRef.current || autocompleteRef.current) return

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ['us'] },
        fields: ['address_components', 'formatted_address'],
        types: ['address']
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (!place?.address_components) return

        const addressData = {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'US'
        }

        place.address_components.forEach((component: AddressComponent) => {
          const type = component.types[0]
          switch (type) {
            case 'street_number':
              addressData.street = component.long_name
              break
            case 'route':
              addressData.street = addressData.street 
                ? `${addressData.street} ${component.long_name}`
                : component.long_name
              break
            case 'locality':
              addressData.city = component.long_name
              break
            case 'administrative_area_level_1':
              addressData.state = component.short_name
              break
            case 'postal_code':
              addressData.postal_code = component.long_name
              break
          }
        })

        form.setValue(`${name}.street`, place.formatted_address || '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.city`, addressData.city, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.state`, addressData.state, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.postal_code`, addressData.postal_code, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.country`, addressData.country, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
      })
    }

    if (window.google) {
      initAutocomplete()
    } else {
      window.addEventListener('google-maps-ready', initAutocomplete)
      return () => {
        window.removeEventListener('google-maps-ready', initAutocomplete)
      }
    }
  }, [form, name])

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          window.dispatchEvent(new Event('google-maps-ready'))
        }}
      />
      <FormField
        control={control}
        name={`${name}.street`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input 
                {...field}
                ref={inputRef}
                placeholder="Enter your address"
                autoComplete="off"
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
        )}
      />
    </>
  )
} 