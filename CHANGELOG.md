# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.9.0](https://github.com/spicy-tomato/neutilities/compare/v1.8.0...v1.9.0) (2025-05-28)


### Features

* display button to show mark modal with out assessment ([894fbcc](https://github.com/spicy-tomato/neutilities/commit/894fbcc9ad68cfe9c8fbfe6875d3021e4bb7c9aa))

## [1.8.0](https://github.com/spicy-tomato/neutilities/compare/v1.7.1...v1.8.0) (2025-04-26)


### Features

* do not fetch data if no internet connection found ([c4e4f8f](https://github.com/spicy-tomato/neutilities/commit/c4e4f8f612b19bf98965b451a6842120c3f7e352))
* only clean storage when updating new version of extension ([70ff775](https://github.com/spicy-tomato/neutilities/commit/70ff7757ad5481043149459834692b5717e3ab2c))

## [1.7.1](https://github.com/spicy-tomato/neutilities/compare/v1.7.0...v1.7.1) (2025-01-13)


### Bug Fixes

* deprecated alarms should be removed ([6da94e6](https://github.com/spicy-tomato/neutilities/commit/6da94e670c091312bf380be778c58cdf5ae1b477))
* tag `updated` should not be displayed after minify rule changes ([f152db6](https://github.com/spicy-tomato/neutilities/commit/f152db6c6727df491973a9fe6ad6a458ed3f0af2))

## [1.7.0](https://github.com/spicy-tomato/neutilities/compare/v1.6.0...v1.7.0) (2025-01-08)


### Features

* read offline ([4023e54](https://github.com/spicy-tomato/neutilities/commit/4023e544e4b70d3dfe0b4a6dc5f98635bdf8658c))

## [1.6.0](https://github.com/spicy-tomato/neutilities/compare/v1.5.1...v1.6.0) (2025-01-07)


### Features

* add related links ([d9465f9](https://github.com/spicy-tomato/neutilities/commit/d9465f9efd7010f4eaf656f4fcd8856e77bdad1a))

## [1.5.1](https://github.com/spicy-tomato/neutilities/compare/v1.5.0...v1.5.1) (2024-12-31)


### Bug Fixes

* do not display tag `updated` when display tag `new` ([9dd1e5e](https://github.com/spicy-tomato/neutilities/commit/9dd1e5e99bf533924728d11c694b6c7a3a142aa7))
* notifications with which updated are not got into update batch ([bb37dd6](https://github.com/spicy-tomato/neutilities/commit/bb37dd6b0ec8c6b1e8ca7a2e2ef79996335fc39b))
* prune not working ([0a727f8](https://github.com/spicy-tomato/neutilities/commit/0a727f889f8ca401df13a67fcd22c651d66afd53))
* tag `updated` does not display ([16a0b77](https://github.com/spicy-tomato/neutilities/commit/16a0b772d09b73ebfe22cdcdae42b7dc6d959244))
* tag `updated` should not be displayed from the second time onwards ([def8024](https://github.com/spicy-tomato/neutilities/commit/def802490b503072d1b9d0b11a153edcabd12c9d))

## [1.5.0](https://github.com/spicy-tomato/neutilities/compare/v1.4.0...v1.5.0) (2024-12-30)


### Features

* check recently updated for every notifications ([af99ad3](https://github.com/spicy-tomato/neutilities/commit/af99ad36673c4acc5524034bda5cf65520059add))
* prune notification with last fetched before 30 days ([806f580](https://github.com/spicy-tomato/neutilities/commit/806f580ed5d0d4c5b7728e8845a54f6045ab5f6d))
* use IndexedDB to save notifications ([5f06f1e](https://github.com/spicy-tomato/neutilities/commit/5f06f1ebaa21a3b53cb2eb22cc6a1a7e6898a8bc))

## [1.4.0](https://github.com/spicy-tomato/neutilities/compare/v1.3.0...v1.4.0) (2024-12-20)


### Features

* use vietnamese ([cbc3918](https://github.com/spicy-tomato/neutilities/commit/cbc39189efeeb12c197092f2affabd7f9c98d4de))

## [1.3.0](https://github.com/spicy-tomato/neutilities/compare/v1.2.0...v1.3.0) (2024-12-16)


### Features

* display tag `updated` for pinned notification has changed since last read ([87bbcdd](https://github.com/spicy-tomato/neutilities/commit/87bbcddc88f3b430c13b2aa2c4a8b06e8c7d2741))
* reset extension ([c7ea2ab](https://github.com/spicy-tomato/neutilities/commit/c7ea2abf0032bd7b859d5f2a54f6edf52ec68d6c))

## [1.2.0](https://github.com/spicy-tomato/neutilities/compare/v1.1.0...v1.2.0) (2024-12-14)


### Features

* display tag `new` ([98e7be2](https://github.com/spicy-tomato/neutilities/commit/98e7be21a19c21f61997328620c2ad6e17157a64))
* pin notification ([dd3d7e3](https://github.com/spicy-tomato/neutilities/commit/dd3d7e375e0410fd78b50a86d571c21b9b776035))

## [1.1.0](https://github.com/spicy-tomato/neutilities/compare/v1.0.1...v1.1.0) (2024-12-11)


### Features

* clear storage and fetch new notifications after installing ([10617ae](https://github.com/spicy-tomato/neutilities/commit/10617ae50c7646119201060336248786a9aa7f77))
* fetch notifications every 5 minutes ([7c9872e](https://github.com/spicy-tomato/neutilities/commit/7c9872e2a54653d6a5ce6cd4b9c9feeff33cd814))
* sort notifications in popup ([09425d6](https://github.com/spicy-tomato/neutilities/commit/09425d69e15b64be6297e9d41fffd74b4f976c05))


### Bug Fixes

* badge is displayed incorrectly if homepage returns anti-crawler result ([69cc658](https://github.com/spicy-tomato/neutilities/commit/69cc658ab5f6712e56fb90c05b5f48a86cc34612))

## 1.0.1 (2024-12-10)


### Features

* display `new` badge when new notification is published ([9da7e41](https://github.com/spicy-tomato/neutilities/commit/9da7e4132ed91dd23fccd43d03333845c96c3a44))


### Bug Fixes

* cannot save latest post from background ([f89dad6](https://github.com/spicy-tomato/neutilities/commit/f89dad64ce00ca27d8f1575ad5925ce0b9089a7f))
