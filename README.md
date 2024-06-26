# ImageGen

[![CI](https://github.com/Neo-Ciber94/ImageGen/actions/workflows/ci.yml/badge.svg)](https://github.com/Neo-Ciber94/ImageGen/actions/workflows/ci.yml)

An AI image generator gallery.

## Features

- [x] Generate Images using AI
- [x] Search images by its prompt
- [x] Preview generated images and see the prompt used
- [x] Delete images
- [x] Dark Mode
- [x] Rate limiting
- [x] Auth
  - [x] Google\*
  - [ ] Github
  - [ ] Discord
- [x] Images saved to S3 and distributed thought Cloudfront
- [x] Prompt improvement system
  - User can improve a prompt for a more detailed
- [x] Token system
  - User require to use tokens to generate images
- [ ] Token regeneration System
  - Each X days the user recover tokens

> \* <small>We are only using google auth for now to prevent multiple accounts from different sources to spam image generation, having only 1 source reduce the possibility of this happening</small>

## Stack

- NextJS
- T3 Stack (TRPC, Typescript, TailwindCSS)
- Drizzle ORM _(With PostgreSQL)_
- HeadlessUI
- Clerk
- OpenAI
- AWS (S3, Cloudfront)

The deployment is done using `SST` which involve using AWS.

## Screenshots

![Home](./public/screenshots/home_dark.png)

![Gallery](./public/screenshots/gallery_dark.png)

---
