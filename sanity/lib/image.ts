import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'

export function urlFor(source: any) {
  return createImageUrlBuilder(client).image(source)
}
