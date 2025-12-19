#!/usr/bin/env node

import fs from "fs-extra";
import { bold, cyan, green, red, yellow } from "kolorist";
import path from "path";
import prompts from "prompts";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  console.log(`\n${bold(cyan("🎨 Create Liminalis App"))}\n`);
  console.log(
    `${cyan("A creative coding framework for MIDI-driven visualizations")}\n`
  );

  let targetDir = process.argv[2];

  if (!targetDir) {
    const result = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-liminalis-app",
      validate: (name) =>
        /^[a-z0-9-_]+$/.test(name) ||
        "Project name must contain only lowercase letters, numbers, hyphens, and underscores",
    });

    if (!result.projectName) {
      console.log(red("✖ Project creation cancelled"));
      process.exit(1);
    }

    targetDir = result.projectName;
  }

  const root = path.join(process.cwd(), targetDir);

  // Check if directory exists
  if (fs.existsSync(root)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Directory ${yellow(targetDir)} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log(red("✖ Project creation cancelled"));
      process.exit(1);
    }

    console.log(`${yellow("⚠")} Removing existing directory...\n`);
    fs.removeSync(root);
  }

  // Use default template
  const template = "default";

  console.log(`\n${green("✔")} Creating project in ${bold(root)}...\n`);

  // Create directory
  fs.ensureDirSync(root);

  // Copy template files
  const templateDir = path.join(__dirname, "..", "templates", template);

  if (!fs.existsSync(templateDir)) {
    console.log(red(`✖ Template "${template}" not found`));
    process.exit(1);
  }

  fs.copySync(templateDir, root);

  // Update package.json with project name
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = path.basename(root);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  console.log(green("✔") + " Project created successfully!\n");
  console.log("Next steps:\n");
  console.log(`  ${cyan("cd")} ${targetDir}`);
  console.log(`  ${cyan("npm install")}`);
  console.log(`  ${cyan("npm run dev")}\n`);
  console.log("📚 Documentation: https://github.com/twray/liminalis\n");
  console.log("Happy coding! 🎵✨\n");
}

init().catch((err) => {
  console.error(red("Error creating project:"));
  console.error(err);
  process.exit(1);
});
