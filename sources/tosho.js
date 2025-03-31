import AbstractSource from './abstract.js'

const QUALITIES = ['1080', '720', '540', '480']

let sneedex = []
const sneedexPromise = (async () => {
  try {
    const res = await fetch(atob('aHR0cHM6Ly9zbmVlZGV4Lm1vZS9hcGkvcHVibGljL255YWE='))
    /** @type {{nyaaIDs: number[]}[]} */
    const json = await res.json()
    sneedex = json.flatMap(({ nyaaIDs }) => nyaaIDs).sort((a, b) => a - b) // sort for binary search
  } catch (e) {}
})()

function binarySearch (arr, el) {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    // Using bitwise or instead of Math.floor as it is slightly faster
    const mid = ((right + left) / 2) | 0
    if (arr[mid] === el) {
      return true
    } else if (el < arr[mid]) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return false
}

/**
 * @param {string=} id
 * @param {string=} link
 * @returns {boolean}
 */
function onSneedex (id, link) {
  if (id && id !== '?' && binarySearch(sneedex, id)) return true
  // nyaa url /view/digits
  const match = link?.match(/\d+/i)
  if (match && binarySearch(sneedex, Number(match[0]))) return true
  return false
}

export default new class Tosho extends AbstractSource {
  name = 'AnimeTosho'
  description = 'Anime Tosho is a free, completely automated service which mirrors most anime torrents. Provides high accuracy searches.'
  /** @type {import('./types.js').Accuracy} */
  accuracy = 'High'

  url = atob('aHR0cHM6Ly9mZWVkLmFuaW1ldG9zaG8ub3JnL2pzb24=')

  buildQuery ({ resolution, exclusions }) {
    const base = `&qx=1&q=!("${exclusions.join('"|"')}")`
    if (!resolution) return base

    const excl = QUALITIES.filter(q => q !== resolution)
    return base + `!(*${excl.join('*|*')}*)`
  }

  /**
   * @param {import('./types.js').Tosho[]} entries
   * @param {boolean} batch
   * @returns {import('./types.js').Result[]}
   **/
  map (entries, batch = false) {
    return entries.map(entry => {
      return {
        title: entry.title || entry.torrent_name,
        link: entry.magnet_uri,
        seeders: (entry.seeders || 0) >= 30000 ? 0 : entry.seeders || 0,
        leechers: (entry.leechers || 0) >= 30000 ? 0 : entry.leechers || 0,
        downloads: entry.torrent_downloaded_count || 0,
        hash: entry.info_hash,
        size: entry.total_size,
        verified: !!entry.anidb_fid,
        type: onSneedex(entry.nyaa_id, entry.torrent_url || entry.article_url || entry.website_url) ? 'alt' : batch ? 'batch' : undefined,
        date: new Date(entry.timestamp * 1000)
      }
    })
  }

  /** @type {import('./types.js').SearchFunction} */
  async single ({ anidbEid, resolution, exclusions }) {
    if (!anidbEid) throw new Error('No anidbEid provided')
    const query = this.buildQuery({ resolution, exclusions })
    const res = await fetch(this.url + '?eid=' + anidbEid + query)

    /** @type {import('./types.js').Tosho[]} */
    const data = await res.json()

    await sneedexPromise
    if (data.length) return this.map(data)
    return []
  }

  /** @type {import('./types.js').SearchFunction} */
  async batch ({ anidbAid, resolution, episodeCount, exclusions }) {
    if (!anidbAid) throw new Error('No anidbAid provided')
    if (episodeCount == null) throw new Error('No episodeCount provided')
    const query = this.buildQuery({ resolution, exclusions })
    const res = await fetch(this.url + '?order=size-d&aid=' + anidbAid + query)

    const data = /** @type {import('./types.js').Tosho[]} */(await res.json()).filter(entry => entry.num_files >= episodeCount)

    await sneedexPromise
    if (data.length) return this.map(data, true)
    return []
  }

  /** @type {import('./types.js').SearchFunction} */
  async movie ({ anidbAid, resolution, exclusions }) {
    if (!anidbAid) throw new Error('No anidbAid provided')
    const query = this.buildQuery({ resolution, exclusions })
    const res = await fetch(this.url + '?aid=' + anidbAid + query)

    /** @type {import('./types.js').Tosho[]} */
    const data = await res.json()

    await sneedexPromise
    if (data.length) return this.map(data, true)
    return []
  }
}()
