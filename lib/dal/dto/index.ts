import type { Database } from '@/database.types'

type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export abstract class BaseDTO<T extends keyof Database['public']['Tables']> {
  constructor(protected data: TableRow<T>) {}

  abstract toJSON(): Record<string, unknown>

  static fromRow<D extends BaseDTO<any>>(
    this: new (data: any) => D,
    row: TableRow<any>
  ): D {
    return new this(row)
  }
}

export class ProfileDTO extends BaseDTO<'profiles'> {
  get isSuperAdmin(): boolean {
    return !!this.data.is_superadmin
  }

  get isActive(): boolean {
    return !!this.data.is_active
  }

  toJSON() {
    return {
      id: this.data.id,
      email: this.data.email,
      fullName: this.data.full_name,
      isSuperAdmin: this.isSuperAdmin,
      isActive: this.isActive,
      avatarUrl: this.data.avatar_url,
      createdAt: this.data.created_at,
    }
  }
} 