import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyPackageJson() {
  try {
    console.log("[Build] Copying package.json ...");
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const distPath = path.join(__dirname, "..", "dist", "package.json");

    const jsonContent = await fs.readFile(packageJsonPath, "utf8");
    const json = JSON.parse(jsonContent);

    const pkg = {
      name: json.name,
      version: json.version,
      type: json.type,
      description: json.description,
      main: "bin.cjs",
      bin: "bin.cjs",
      engines: json.engines,
      dependencies: json.dependencies,
      peerDependencies: json.peerDependencies,
      repository: json.repository,
      author: json.author,
      license: json.license,
      bugs: json.bugs,
      homepage: json.homepage,
      tags: json.tags,
      keywords: json.keywords,
    };

    await fs.writeFile(distPath, JSON.stringify(pkg, null, 2));
    console.log("[Build] Build completed.");
  } catch (error) {
    console.error("Error copying package.json:", error);
    process.exit(1);
  }
}

copyPackageJson();