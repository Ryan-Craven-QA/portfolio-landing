---
title: A monthly maintenance routine for WordPress sites
description: A practical, repeatable checklist for keeping a WordPress site updated, backed up, and tidy — in about an hour a month.
type: guide
status: published
publishDate: 2026-11-07
business: wordpress-plugins
tags: [wordpress, maintenance, backups, security, checklist]
featured: true
download:
  label: Maintenance checklist
  href: /downloads/wordpress-maintenance-checklist.csv
  format: CSV
---

Most WordPress problems are not dramatic. They build up quietly: a plugin that
stopped receiving updates, a former contractor who still has an administrator
account, a backup job that failed months ago without anyone noticing. A short,
regular routine catches these while they are still small.

This guide is the routine we recommend. Block out an hour once a month, work
through it in order, and keep a note of what you changed.

## Before you start: confirm you can restore

A backup you have never restored is a hope, not a plan. Before touching
anything else, make sure that:

- backups are actually running on schedule (check the date of the most recent one),
- they include both the **database** and the **files** (themes, plugins, uploads), and
- they are stored somewhere other than the server the site runs on.

At least once a quarter, restore a backup to a staging site and check that it
works. It is the only way to know.

## The monthly checklist

### 1. Update WordPress, themes, and plugins

Updates fix security issues as well as bugs, so falling behind carries real
risk. Before updating, skim the changelog of anything with a major version
change. For important sites, apply larger updates on a staging copy first.

Afterwards, load the homepage and a few key pages, and submit any important
forms to make sure nothing broke.

### 2. Remove what you don't use

Deactivated plugins and unused themes still sit on the server, and their code
can still contain vulnerabilities. If you are not using something, delete it.
Keep one default theme installed as a fallback.

### 3. Review user accounts

Open **Users** and look for accounts that should no longer exist — former
staff, finished contractors, test logins. Check who has the Administrator role
and reduce it wherever a lower role would do. Make sure every remaining account
uses a strong, unique password, and turn on two-factor authentication for
administrators if your setup supports it.

### 4. Check Site Health

WordPress includes a built-in report under **Tools → Site Health**. Work
through anything it flags as critical, and note recommendations — such as an
outdated PHP version — to raise with your host.

### 5. Look for broken links and forgotten documents

Old PDFs and price lists linger long after they stop being accurate, and pages
that link to removed files lead visitors to dead ends. Spot-check your most
visited pages, and once a quarter review the documents in your media library:
what is outdated, what is unused, and what is still linked.

### 6. Test the things that matter

Submit your contact form and confirm the message arrives. Click through to
your checkout or booking links. If the site sends email (password resets,
order notifications), trigger one and check it lands.

### 7. Glance at performance

Load a few pages on your phone over mobile data. If a page feels slow, the
usual culprits are oversized images and plugins that load scripts on every
page. Note anything worth fixing next month rather than fixing everything at
once.

## Keep a log

Write down the date, what you updated, and anything unusual. When something
does go wrong, a log turns "it broke at some point" into "it broke after
Tuesday's update", which is far easier to fix.

## Get the checklist

The free checklist below contains every step in this guide, with columns for
the date and notes. Import it into a spreadsheet or task manager and reuse it
each month.
