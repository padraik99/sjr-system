# SJR System

This repo is public and serves GitHub Pages at `https://padraik99.github.io/sjr-system/`.
It holds only the pages that get shared: guides, library, dashboard and tools.

**The working notes live in the private repo `padraik99/sjr-private`.** Read its
`CLAUDE.md` before changing anything here: it has the file inventory, the technical
standards, the commit conventions and the athlete context.

Two rules for this repo:

- Nothing private goes in here. No injury records, clinical notes, audits or plans.
  Every file in this repo is publicly readable, and anything committed stays in the
  history even after it's deleted.
- Run `node --check` on the extracted script of any HTML you change, and
  `node gate_test.js` for any change to the Patrick weekly guide.
