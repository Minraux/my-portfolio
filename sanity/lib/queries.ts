import { cache } from 'react'
import { client } from './client'

export async function getFeaturedWorks() {
  return client.fetch(`*[_type == "work" && featured == true && hidden != true] | order(year desc) [0..2] {
    _id, title, slug, type, year, "image": images[0] { ..., "url": asset->url }
  }`, {}, { next: { revalidate: 300 } })
}

export async function getLatestPosts() {
  return client.fetch(`*[_type == "post" && featured == true && hidden != true] | order(publishedAt desc) [0..2] {
    _id, title, slug, publishedAt, "excerpt": pt::text(body)[0..150]
  }`, {}, { next: { revalidate: 300 } })
}

export async function getAllWorks() {
  return client.fetch(`*[_type == "work" && hidden != true] | order(year desc) {
    _id, title, slug, type, year, canvasTop, canvasLeft,
    "image": images[0] { ..., "url": asset->url }
  }`, {}, { next: { revalidate: 300 } })
}

export async function getWork(slug: string) {
  return client.fetch(`*[_type == "work" && slug.current == $slug][0] {
    _id, title, slug, type, description, year, location,
    mediaType, mediaUrl, embedCode, "mediaFile": mediaFile.asset->url,
    images[] { ..., "url": asset->url },
    body[] { ..., _type == "image" => { ..., "url": asset->url } },
    seo { title, description, "ogImage": ogImage { ..., "url": asset->url } }
  }`, { slug }, { next: { revalidate: 300 } })
}

export async function getAllPosts() {
  return client.fetch(`*[_type == "post" && hidden != true] | order(publishedAt desc) {
    _id, title, slug, publishedAt, tags, excerpt, canvasTop, canvasLeft,
    "coverImage": coverImage { ..., "url": asset->url }
  }`, {}, { next: { revalidate: 300 } })
}

export async function getPost(slug: string) {
  return client.fetch(`*[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, publishedAt, tags, excerpt,
    "coverImage": coverImage { ..., "url": asset->url },
    body[] {
      ...,
      _type == "image" => { ..., "url": asset->url }
    },
    seo { title, description, "ogImage": ogImage { ..., "url": asset->url } }
  }`, { slug }, { next: { revalidate: 300 } })
}

export async function getAbout() {
  return client.fetch(`*[_type == "about"][0] {
    bio, "photo": photo { ..., "url": asset->url }, "cv": cv.asset->url
  }`, {}, { next: { revalidate: 300 } })
}

export async function getAllTeaching() {
  return client.fetch(`*[_type == "teaching"] | order(_createdAt desc) {
    _id, title, description, dates, location, "images": images[] { ..., "url": asset->url }
  }`, {}, { next: { revalidate: 300 } })
}

export async function getSource() {
  // Сначала ищем новый тип source, затем fallback на teaching
  const source = await client.fetch(`*[_type == "source"][0] { body[] { ..., _type == "image" => { ..., "url": asset->url } } }`, {}, { next: { revalidate: 300 } })
  if (source?.body) return source
  const teaching = await client.fetch(`*[_type == "teaching"][0] { title, description[] { ..., _type == "image" => { ..., "url": asset->url } } }`, {}, { next: { revalidate: 300 } })
  if (teaching?.description) return { title: teaching.title, body: teaching.description }
  return null
}

export const getSettings = cache(async function getSettings() {
  return client.fetch(`*[_type == "settings"][0] {
    name, email, heroEnabled,
    "heroImage": heroImage { ..., "url": asset->url },
    socials[] { label, url, icon }
  }`, {}, { next: { revalidate: 300 } })
})
