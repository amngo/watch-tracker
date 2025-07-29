'use client'

import { redirect } from 'next/navigation'

export default function LibraryPage() {
  // Redirect to movies tab by default
  redirect('/library/movies')
}