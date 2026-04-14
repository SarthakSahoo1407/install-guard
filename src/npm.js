import axios from "axios";

export async function getPackageData(pkg) {
  const registryUrl = `https://registry.npmjs.org/${pkg}`;
  const downloadUrl = `https://api.npmjs.org/downloads/point/last-week/${pkg}`;

  const [registryRes, downloadRes] = await Promise.all([
    axios.get(registryUrl),
    axios.get(downloadUrl),
  ]);

  const data = registryRes.data;
  const latest = data["dist-tags"].latest;
  const versionData = data.versions[latest];

  return {
    name: data.name,
    maintainers: data.maintainers?.length || 0,
    lastPublished: data.time?.[latest],
    hasInstallScript:
      versionData.scripts?.install ||
      versionData.scripts?.postinstall ||
      false,
    version: latest,
    downloads: downloadRes.data.downloads || 0,
  };
}