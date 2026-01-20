# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.6.0-alpha] - 2026-01-20

### Added

- Add intelligent syntax completion feature for code editor
- Add OML syntax completion support and example tables
- Add bilingual (Chinese/English) completion hint tables

### Changed

- Optimize code editor component completion experience
- Improve debug interface and error handling

### Fixed

- Fix code editor related issues

## [1.5.0] - 2026-01-17

### Added

- Add CI for unit test coverage
- Add smart bracket skipping and improve example list UX
- Implement three-branch strategy for dependency management and release workflow

### Changed

- Upgrade dependencies to version 1.10.0-alpha and update related packages
- Transform and parse interfaces to eliminate duplicate titles
- Optimize table display on debugging page and data processing logic
- Update documentation

### Fixed

- Fix occlusion issue in bottom row of table mode result display
- Optimize result display table format array presentation
- Fix flexible adaptive design of rule examples
- Fix logical errors in parsing rules of sample library containing slashes
- Fix project name and link references in release workflow

### Removed

- Remove Docker image build and publish workflow to simplify CI/CD configuration
- Remove Cargo configuration
