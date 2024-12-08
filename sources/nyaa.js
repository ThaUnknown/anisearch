// I gave up on this, its gonna be ~2k LOC, and not even be reasonably accurate, just to get 2% more uptime and 1 min less delay on releases, not worth it.

// import AbstractSource from './abstract.js'

// const QUALITIES = ['1080', '720', '540', '480']

// // padleft a variable with 0 ex: 1 => '01'
// function zeropad (v = 1, l = 2) {
//   return (typeof v === 'string' ? v : v.toString()).padStart(l, '0')
// }

// const epstring = ep => `"E${zeropad(ep)}+"|"E${zeropad(ep)}v"|"+${zeropad(ep)}+"|"+${zeropad(ep)}v"`
// // [EO]?[-EPD _—]\d{2}(?:[-v _.—]|$)
// // /[EO]?[-EPD]\d{2}(?:[-v.]|$)|[EO]?[EPD ]\d{2}(?:[v .]|$)|[EO]?[EPD_]\d{2}(?:[v_.]|$)|[EO]?[EPD—]\d{2}(?:[v.—]|$)|\d{2} ?[-~—] ?\d{2}/i
// // matches: OP01 ED01 EP01 E01 01v 01. -01- _01_ with spaces and stuff
// const epNumRx = /[EO]?[-EPD]\d{2}(?:[-v.]|$)|[EO]?[EPD ]\d{2}(?:[v .]|$)|[EO]?[EPD_]\d{2}(?:[v_.]|$)|[EO]?[EPD—]\d{2}(?:[v.—]|$)|\d{2} ?[-~—] ?\d{2}/i

// // create an array of potentially valid titles from a given media
// function createTitle (_titles) {
//   // group and de-duplicate
//   const grouped = [
//     ...new Set(
//       _titles.filter(name => name != null && name.length > 3)
//     )
//   ]
//   const titles = []
//   const appendTitle = t => {
//     // replace & with encoded
//     const title = t.replace(/&/g, '%26').replace(/\?/g, '%3F').replace(/#/g, '%23')
//     titles.push(title)

//     // replace Season 2 with S2, else replace 2nd Season with S2, but keep the original title
//     const match1 = title.match(/(\d)(?:nd|rd|th) Season/i)
//     const match2 = title.match(/Season (\d)/i)

//     if (match2) {
//       titles.push(title.replace(/Season \d/i, `S${match2[1]}`))
//     } else if (match1) {
//       titles.push(title.replace(/(\d)(?:nd|rd|th) Season/i, `S${match1[1]}`))
//     }
//   }
//   for (const t of grouped) {
//     appendTitle(t)
//     if (t.includes('-')) appendTitle(t.replaceAll('-', ''))
//   }
//   return titles
// }

// function findEdge (media, type, formats = ['TV', 'TV_SHORT'], skip) {
//   let res = media.relations.edges.find(edge => {
//     if (edge.relationType === type) {
//       return formats.includes(edge.node.format)
//     }
//     return false
//   })
//   // this is hit-miss
//   if (!res && !skip && type === 'SEQUEL') res = findEdge(media, type, formats = ['TV', 'TV_SHORT', 'OVA'], true)
//   return res
// }

// function getMediaMaxEp (media, playable) {
//   if (playable) {
//     return media.nextAiringEpisode?.episode - 1 || media.airingSchedule?.nodes?.[0]?.episode - 1 || media.episodes
//   } else {
//     return media.episodes || media.nextAiringEpisode?.episode - 1 || media.airingSchedule?.nodes?.[0]?.episode - 1
//   }
// }

// function parseRSSNodes (nodes) {
//   return nodes.map(item => {
//     const pubDate = item.querySelector('pubDate')?.textContent

//     return {
//       title: item.querySelector('title')?.textContent || '?',
//       link: item.querySelector('enclosure')?.attributes.url.value || item.querySelector('link')?.textContent || '?',
//       seeders: item.querySelector('seeders')?.textContent ?? '?',
//       leechers: item.querySelector('leechers')?.textContent ?? '?',
//       downloads: item.querySelector('downloads')?.textContent ?? '?',
//       size: item.querySelector('size')?.textContent ?? '?',
//       date: pubDate && new Date(pubDate)
//     }
//   })
// }

// /**
//    *
//    * @param {{ media:any, episode?:number, force?:boolean, increment?:boolean, offset?: number, rootMedia?:any }} opts
//    * @returns
//    */
// async function resolveSeason (opts) {
//   // media, episode, increment, offset, force
//   if (!opts.media || !(opts.episode || opts.force)) throw new Error('No episode or media for season resolve!')

//   let { media, episode, increment, offset = 0, rootMedia = opts.media, force } = opts

//   const rootHighest = (rootMedia.nextAiringEpisode?.episode || rootMedia.episodes)

//   const prequel = !increment && findEdge(media, 'PREQUEL')?.node
//   const sequel = !prequel && (increment || increment == null) && findEdge(media, 'SEQUEL')?.node
//   const edge = prequel || sequel
//   increment = increment ?? !prequel

//   if (!edge) {
//     return { media, episode: episode - offset, offset, increment, rootMedia, failed: true }
//   }
//   media = (await this.getAnimeById(edge.id)).data.Media

//   const highest = media.nextAiringEpisode?.episode || media.episodes

//   const diff = episode - (highest + offset)
//   offset += increment ? rootHighest : highest
//   if (increment) rootMedia = media

//   // force marches till end of tree, no need for checks
//   if (!force && diff <= rootHighest) {
//     episode -= offset
//     return { media, episode, offset, increment, rootMedia }
//   }

//   return resolveSeason({ media, episode, increment, offset, rootMedia, force })
// }

// const DOMPARSER = (typeof DOMParser !== 'undefined') && DOMParser.prototype.parseFromString.bind(new DOMParser())

// async function getRSSContent (url) {
//   if (!url) return null
//   try {
//     const res = await fetch(url)
//     if (!res.ok) {
//       throw new Error('Failed fetching RSS!\n' + res.statusText)
//     }
//     return DOMPARSER(await res.text(), 'text/xml')
//   } catch (e) {
//     throw new Error('Failed fetching RSS!\n' + e.message)
//   }
// }

// export default new class Nyaa extends AbstractSource {
//   name = 'Nyaa'
//   description = 'Nyaa is a public, closed tracker. Offers no good API or searches, and its searches are generally low accuracy, and very slow.'
//   /** @type {import('./types.js').Accuracy} */
//   accuracy = 'Low'

//   /**
//    * @param {import('./types.js').Tosho[]} entries
//    * @param {boolean} batch
//    * @returns {import('./types.js').Result[]}
//    **/
//   map (entries, batch = false) {
//     return []
//   }

//   /** @type {import('./types.js').SearchFunction} */
//   async single ({ media, episode, exclusions, resolution }) {/
//     // mode cuts down on the amt of queries made 'check' || 'batch'
//     const titles = createTitle(media).join(')|(')

//     const prequel = findEdge(media, 'PREQUEL')?.node
//     const sequel = findEdge(media, 'SEQUEL')?.node
//     const isBatch = media.status === 'FINISHED' && media.episodes !== 1

//     // if media has multiple seasons, and this S is > 1, then get the absolute episode number of the episode
//     const absolute = prequel && !mode && (await resolveSeason({ media, episode, force: true }))
//     const absoluteep = absolute?.offset + episode
//     const episodes = [episode]

//     // only use absolute episode number if its smaller than max episodes this series has, ex:
//     // looking for E1 of S2, S1 has 12 ep and S2 has 13, absolute will be 13
//     // so this would find the 13th ep of the 2nd season too if this check wasnt here
//     if (absolute && absoluteep < (getMediaMaxEp(media) || episode)) {
//       episodes.push(absoluteep)
//     }

//     let ep = ''
//     if (media.episodes !== 1 && mode !== 'batch') {
//       if (isBatch) {
//         const digits = Math.max(2, Math.log(media.episodes) * Math.LOG10E + 1 | 0)
//         ep = `"${zeropad(1, digits)}-${zeropad(media.episodes, digits)}"|"${zeropad(1, digits)}~${zeropad(media.episodes, digits)}"|"Batch"|"Complete"|"${zeropad(episode)}+"|"${zeropad(episode)}v"`
//       } else {
//         ep = `(${episodes.map(epstring).join('|')})`
//       }
//     }

//     const excl = exclusions.join('|')
//     const quality = (!ignoreQuality && (`"${resolution}"` || '"1080"')) || ''
//     const url = new URL(`${''}/?page=rss&c=1_2&f=0&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)

//     let nodes = [...(await getRSSContent(url)).querySelectorAll('item')]

//     if (absolute) {
//     // if this is S > 1 aka absolute ep number exists get entries for S1title + absoluteEP
//     // the reason this isnt done with recursion like sequelEntries is because that would include the S1 media dates
//     // we want the dates of the target media as the S1 title might be used for SX releases
//       const titles = createTitle(absolute.media).join(')|(')

//       const url = new URL(`${''}/?page=rss&c=1_2&f=0&s=seeders&o=desc&q=(${titles})${epstring(absoluteep)}${quality}-(${excl})`)
//       nodes = [...nodes, ...(await getRSSContent(url)).querySelectorAll('item')]
//     }

//     let entries = parseRSSNodes(nodes)

//     const checkSequelDate = media.status === 'FINISHED' && (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') && sequel.startDate

//     const sequelStartDate = checkSequelDate && new Date(Object.values(checkSequelDate).join(' '))

//     // recursive, get all entries for media sequel, and its sequel, and its sequel
//     const sequelEntries =
//       (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') &&
//         (await this.single({ media: (await anilistClient.searchIDSingle({ id: sequel.id })).data.Media, episode, mode: mode || 'check' }))

//     const checkPrequelDate = (media.status === 'FINISHED' || media.status === 'RELEASING') && prequel?.status === 'FINISHED' && prequel?.endDate

//     const prequelEndDate = checkPrequelDate && new Date(Object.values(checkPrequelDate).join(' '))

//     // 1 month in MS, a bit of jitter for pre-releases and releasers being late as fuck, lets hope it doesnt cause issues
//     const month = 2674848460

//     if (prequelEndDate) {
//       entries = entries.filter(entry => entry.date > new Date(+prequelEndDate + month))
//     }

//     if (sequelStartDate && media.format === 'TV') {
//       entries = entries.filter(entry => entry.date < new Date(+sequelStartDate - month))
//     }

//     if (sequelEntries?.length) {
//       if (mode === 'check') {
//         entries = [...entries, ...sequelEntries]
//       } else {
//         entries = entries.filter(entry => !sequelEntries.find(sequel => sequel.link === entry.link))
//       }
//     }

//     // this gets entries without any episode limiting, and for batches
//     const batchEntries = !mode && isBatch && (await this.single({ media, episode, ignoreQuality, mode: 'batch' })).filter(entry => {
//       return !epNumRx.test(entry.title)
//     })

//     if (batchEntries?.length) {
//       entries = [...entries, ...batchEntries]
//     }

//     // some archaic shows only have shit DVD's in weird qualities, so try to look up without any quality restrictions when there are no results
//     if (!entries.length && !ignoreQuality && !mode) {
//       entries = await this.single({ media, episode, ignoreQuality: true })
//     }
//     return []
//   }

//   /** @type {import('./types.js').SearchFunction} */
//   async batch (opts) {
//     return []
//   }

//   /** @type {import('./types.js').SearchFunction} */
//   async movie (opts) {
//     return []
//   }
// }()
