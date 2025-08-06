import { TMDB } from 'tmdb-ts'

export const tmdb = new TMDB(process.env.NEXT_PUBLIC_TMDB_API_KEY!)
