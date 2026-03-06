import { client } from './client'

export async function getFeaturedWorks() {
  return client.fetch(`*[_type == "work" && featured == true] | order(_createdAt desc) {
    _id, title, slug, type, description, year, "image": images[0]
  }`)
}

export async function getAllWorks() {
  return client.fetch(`*[_type == "work"] | order(year desc) {
    _id, title, slug, type, description, year, location, "image": images[0]
  }`)
}

export async function getWork(slug: string) {
  return client.fetch(`*[_type == "work" && slug.current == $slug][0] {
    _id, title, slug, type, description, year, location,
    mediaType, mediaUrl, embedCode, "mediaFile": mediaFile.asset->url,
    images[] { ..., "url": asset->url }
  }`, { slug })
}

export async function getAllPosts() {
  return client.fetch(`*[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, tags
  }`)
}

export async function getPost(slug: string) {
  return client.fetch(`*[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, publishedAt, tags, body[] {
      ...,
      _type == "image" => { ..., "url": asset->url }
    }
  }`, { slug })
}

export async function getAbout() {
  return client.fetch(`*[_type == "about"][0] {
    bio, "photo": photo { ..., "url": asset->url }, "cv": cv.asset->url
  }`)
}

export async function getAllTeaching() {
  return client.fetch(`*[_type == "teaching"] | order(_createdAt desc) {
    _id, title, description, dates, location, "images": images[] { ..., "url": asset->url }
  }`)
}

export async function getSettings() {
  return client.fetch(`*[_type == "settings"][0] {
    name, email,
    "heroImage": heroImage { ..., "url": asset->url },
    socials[] { label, url, icon }
  }`)
}
