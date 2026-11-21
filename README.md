# mrvoje.com

Hi, I'm **Hrvoje Mrvoje**. I'm a software developer interested in AI and in how it changes the
way software gets built.

This repository is my personal website, [mrvoje.com](https://mrvoje.com): a short introduction
and a list of the things I build. Each project lives at its own address and in its own repository;
the site links to them.

It also hosts the Plumcast download page at [plumcast.mrvoje.com](https://plumcast.mrvoje.com)
(the same site under a second address).

## How it's built

- **Fast.** A small Angular app that loads in a fraction of a second.
- **Private.** No backend, no cookies, no tracking, strict browser security rules.
- **Carefully designed.** Clean and calm, light and dark mode, keyboard and screen-reader friendly.
  The colours come from a shared design package, so every project looks like part of one family.
- **Checked automatically.** Every change is tested before it goes live.

Built with Angular, TypeScript and Tailwind CSS, hosted on Azure Static Web Apps.

## Contact

Interested in working together, or have an idea for a project? Get in touch through
[mrvoje.com](https://mrvoje.com) or at hmrvoje@gmail.com.

<details>
<summary>For developers: run it locally</summary>

Requires Node 24.

```bash
npm install
npm run dev     # development server
npm test        # all tests
npm run build   # static site in dist/
```

Every push to `master` is tested, built and deployed by GitHub Actions.

</details>
