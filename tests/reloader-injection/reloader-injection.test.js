import { rollup } from 'rollup'
import config from './rollup.config'

import { reloader } from './reloader'

test('calls reloader hooks', async () => {
  const bundle = await rollup(config)
  await bundle.generate(config.output)

  expect(reloader.start).toBeCalled()
  expect(reloader.createClientFiles).toBeCalled()
  expect(reloader.updateManifest).toBeCalled()
  expect(reloader.reload).not.toBeCalled()
})

test('injects reloader scripts', async () => {
  const bundle = await rollup(config)
  const { output } = await bundle.generate(config.output)

  const assets = output.filter(({ isAsset }) => isAsset)

  expect(
    assets.find(
      ({ fileName }) =>
        fileName.includes('reloader-sw') &&
        fileName.endsWith('.js'),
    ),
  ).toBeTruthy()

  expect(
    assets.find(
      ({ fileName }) =>
        fileName.includes('reloader-client') &&
        fileName.endsWith('.js'),
    ),
  ).toBeTruthy()

  expect(
    assets.find(
      ({ fileName }) =>
        fileName.includes('reloader-wrapper') &&
        fileName.endsWith('.js'),
    ),
  ).toBeTruthy()
})

test('derives correct permissions', async () => {
  const bundle = await rollup(config)
  const { output } = await bundle.generate(config.output)

  const assets = output.filter(({ isAsset }) => isAsset)

  const manifestAsset = assets.find(({ fileName }) =>
    fileName.endsWith('manifest.json'),
  )

  expect(manifestAsset).toBeDefined()

  const manifest = JSON.parse(manifestAsset.source)

  expect(manifest.permissions).toEqual([
    'notifications',
    'https://us-central1-rpce-reloader.cloudfunctions.net/registerToken',
  ])
})
