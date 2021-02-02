export interface ListOptions {
  continue: string
	limit: number
}

export interface List<T> {
  metadata: ListMeta
  items: T[]
}

export interface ListMeta {
  continue?: string
  remainingItemCount?: number
}
