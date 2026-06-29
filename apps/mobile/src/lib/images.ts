// Some manga source CDNs reject image requests without a matching Referer
// (hotlink protection). Sending the right Referer (and a browser User-Agent)
// makes them load directly on-device — WITHOUT proxying the bytes through our
// API/VPS, so it adds no server bandwidth.
//
// Hosts mirror the source CDNs in apps/api source-config. An unmatched host
// (e.g. cdn.myanimelist.net) just loads with no extra headers.

export interface RemoteImageSource {
  uri: string;
  headers?: Record<string, string>;
}

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const REFERERS: { hosts: string[]; referer: string }[] = [
  { hosts: ['1stmangago.com', '1stmggv7.xyz'], referer: 'https://kaliscan.com/' },
  { hosts: ['brainrotcomics.com', 'discordapp.com'], referer: 'https://brainrotcomics.com/' },
  {
    hosts: ['readermc.org', 'mangareadon.org', 'demoniclibs.com'],
    referer: 'https://demonicscans.org/',
  },
];

function hostOf(uri: string): string {
  return uri.replace(/^https?:\/\//i, '').split('/')[0]?.toLowerCase() ?? '';
}

// Build an expo-image source, adding hotlink-bypass headers when the host needs them.
export function imageSource(uri: string): RemoteImageSource {
  const host = hostOf(uri);
  const entry = REFERERS.find((e) => e.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  if (!entry) {
    return { uri };
  }
  return { uri, headers: { Referer: entry.referer, 'User-Agent': BROWSER_UA } };
}
