import { Octokit } from '@octokit/rest'
import {writeFile} from "fs"
import { Buffer } from 'buffer';

const octokit = new Octokit()

function findDebAsset(assets) {
    return assets.filter((asset) => {
        return asset.name.endsWith('amd64.deb')
      })[0]
}

export async function getLatestReleaseAsset() {
  let latestRelease = await octokit.repos.getLatestRelease({
    owner: 'quarto-dev',
    repo: 'quarto-cli',
  })
  let debAsset = findDebAsset(latestRelease.data.assets)

  return {
    download_url: debAsset.browser_download_url,
    html_url: latestRelease.data.html_url,
    name: debAsset.name,
    tag: latestRelease.data.tag_name,
    asset_id: debAsset.id,
  }
}

export async function getAssetByTag(tag) {
    // this will throw if the tag isn't valid with an HttpError
    // with status 404 and data with message "Not Found"
    let release = await octokit.repos.getReleaseByTag({
        owner: 'quarto-dev',
        repo: 'quarto-cli',
        tag
    })
   let debAsset = findDebAsset(release.data.assets)

  return {
    download_url: debAsset.browser_download_url,
    html_url: release.data.html_url,
    name: debAsset.name,
    tag: release.data.tag_name,
    asset_id: debAsset.id,
  }
}

export async function downloadReleaseAsset({asset_id, path}) {
    if (!path) {
        path = "/tmp/quarto.deb"
    }
    let buf = await octokit.repos.getReleaseAsset({
        headers: {
            'Accept': 'application/octet-stream'
        },
        owner: 'quarto-dev',
        repo: 'quarto-cli',
        asset_id: asset_id,
    })
    writeFile(path, Buffer.from(buf.data), (err) => {
        if (err) {
        throw err
        }
    })
    return path
}
