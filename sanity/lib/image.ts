import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

export function imageUrl(source: any, width: number): string {
  return builder.image(source).width(width).auto('format').fit('max').url()
}
