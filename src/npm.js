export async function getPackageData(pkg) {
  const encodedPkg = encodeURIComponent(pkg).replace("%40", "@");
  const registryUrl = `https://registry.npmjs.org/${encodedPkg}`;
  const downloadUrl = `https://api.npmjs.org/downloads/point/last-week/${encodedPkg}`;

  const [registryRes, downloadRes] = await Promise.all([
    fetch(registryUrl).then((r) => {
      if (!r.ok) throw new Error(`Package "${pkg}" not found on npm`);
      return r.json();
    }),
    fetch(downloadUrl)
      .then((r) => r.json())
      .catch(() => ({ downloads: 0 })),
  ]);

  const data = registryRes;
  const latest = data["dist-tags"]?.latest;
  if (!latest) throw new Error(`No published version found for "${pkg}"`);

  const versionData = data.versions?.[latest] || {};
  const timeData = data.time || {};

  return {
    name: data.name,
    version: latest,
    description: data.description || "",
    downloads: downloadRes.downloads || 0,
    maintainers: data.maintainers || [],
    license: versionData.license || data.license || "Unknown",
    lastPublished: timeData[latest],
    firstPublished: timeData.created,
    hasInstallScript: !!(
      versionData.scripts?.install ||
      versionData.scripts?.preinstall ||
      versionData.scripts?.postinstall
    ),
    deprecated: versionData.deprecated || false,
    repository: data.repository?.url || versionData.repository?.url || null,
    dependencies: Object.keys(versionData.dependencies || {}).length,
    totalVersions: Object.keys(data.versions || {}).length,
  };
}