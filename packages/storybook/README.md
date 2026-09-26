# @bwp-web/storybook

The Storybook deployment, and nothing else. The Storybook itself (its configuration, stories and
cases) lives in [`@bwp-web/components`](../components/stories/README.md); this package only builds
it into `dist/` for Vercel.

It exists because the Vercel project deploys every branch the same way: root directory
`packages/storybook`, the install at the repository root, `turbo run build` there, and `dist`
published. The V1 branches (`main`, `v1`) keep their own Storybook package in this place, so one
set of project settings serves V1 and V2 alike, and a push to `v2-SOLAR` deploys V2's Storybook at
the branch's Vercel URL with no setting changed.

```bash
npm run build -w @bwp-web/storybook   # writes packages/storybook/dist/
```

It depends on every workspace package the Storybook build reads (`components`, `styles`, `assets`,
`codegen`), since Vercel skips a deployment when nothing the root directory depends on changed.
`packages/codegen/test/storybook-deploy.test.mjs` keeps the name, the build and those
dependencies as the project settings need them.
