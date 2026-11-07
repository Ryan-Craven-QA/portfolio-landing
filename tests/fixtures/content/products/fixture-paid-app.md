---
name: Fixture Paid App
business: fixture-software
type: web-app
summary: A fixture product with one-time, subscription and agency offers, all on verified checkout hosts.
tagline: Fixture tagline for the paid app.
visibility: public
availability: available
featured: true
featuredOrder: 1
releaseDate: 2026-10-01
updatedDate: 2026-10-15
version: "1.2"
offers:
  - id: personal
    label: Personal
    price: 49
    billing: one-time
    license: personal
    checkoutUrl: https://fixture.gumroad.com/l/paid-app
    features: [Fixture feature one, Fixture feature two]
  - id: monthly
    label: Monthly
    price: 9
    billing: monthly
    checkoutUrl: https://buy.stripe.com/test_fixture123
    recommended: true
    note: Fixture note about billing.
  - id: agency
    label: Agency
    price: 199
    billing: yearly
    license: agency
    scope: Unlimited client sites
    checkoutUrl: https://fixture.lemonsqueezy.com/checkout/buy/agency
includes: [Fixture include one, Fixture include two]
highlights:
  - title: Fixture highlight
    body: Fixture highlight body text.
requirements: [Fixture requirement]
formats: [Web]
cover:
  src: ../../assets/fixture-cover.png
  alt: Fixture cover image showing a stylised interface
screenshots:
  - src: ../../assets/fixture-screenshot.png
    alt: Fixture screenshot of the settings screen
    caption: Fixture screenshot caption
links:
  documentation: /resources/fixture-docs/
related: [fixture-free-template]
tags: [fixture, invoices]
faqs:
  - question: Fixture product question?
    answer: Fixture product answer.
---

Fixture long description for the paid app.

## Fixture subheading

More fixture body text.
