import { getCached, setCache } from "./cache.js";

function encodePkg(pkg) {
  return encodeURIComponent(pkg).replace("%40", "@");
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/**
 * Fetches full registry metadata for a package.
 * Returns the raw document from registry.npmjs.org/<pkg>
 */
export async function getRegistryData(pkg) {
  const key = `registry:${pkg}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchJSON(`https://registry.npmjs.org/${encodePkg(pkg)}`);
  setCache(key, data);
  return data;
}

/**
 * Fetches weekly download count.
 */
export async function getDownloads(pkg) {
  const key = `downloads:${pkg}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const data = await fetchJSON(
      `https://api.npmjs.org/downloads/point/last-week/${encodePkg(pkg)}`
    );
    setCache(key, data);
    return data;
  } catch {
    return { downloads: 0 };
  }
}

/**
 * Resolves version, fetches metadata + downloads, returns a normalized context
 * that every check module can consume.
 */
export async function buildContext(pkg, requestedVersion) {
  const registry = await getRegistryData(pkg);
  const latest = registry["dist-tags"]?.latest;
  if (!latest) throw new Error(`No published version found for "${pkg}"`);

  const version = requestedVersion || latest;
  const versionData = registry.versions?.[version];
  if (!versionData) throw new Error(`Version "${version}" not found for "${pkg}"`);

  const timeData = registry.time || {};
  const allVersions = Object.keys(registry.versions || {});
  const versionIndex = allVersions.indexOf(version);
  const previousVersion = versionIndex > 0 ? allVersions[versionIndex - 1] : null;
  const previousVersionData = previousVersion
    ? registry.versions[previousVersion]
    : null;

  const downloads = await getDownloads(pkg);

  return {
    name: registry.name,
    version,
    previousVersion,
    description: registry.description || "",
    downloads: downloads.downloads || 0,
    maintainers: registry.maintainers || [],
    license: versionData.license || registry.license || "Unknown",
    publishedAt: timeData[version],
    previousPublishedAt: previousVersion ? timeData[previousVersion] : null,
    firstPublished: timeData.created,
    repository: registry.repository?.url || versionData.repository?.url || null,
    deprecated: versionData.deprecated || false,
    totalVersions: allVersions.length,
    allVersions,

    // Script data
    scripts: versionData.scripts || {},

    // Dependency data
    dependencies: versionData.dependencies || {},
    previousDependencies: previousVersionData?.dependencies || {},

    // Maintainer history — registry only exposes current maintainers
    currentMaintainers: registry.maintainers || [],

    // Raw registry for advanced checks
    _registry: registry,
    _versionData: versionData,
  };
}
