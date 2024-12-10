'use client'

import { AddressField } from "@/components/ui/form/address-field"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"

export function AddressSection() {
  const { control } = useFormContext()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Location</h3>
      <AddressField
        control={control}
        name="location.address"
        label="Event Address"
        description="The physical address where the event will take place"
      />
      
      <FormField
        control={control}
        name="location.specific_location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specific Location</FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="e.g., Room 101, Main Hall, etc."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 