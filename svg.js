const fs = require("fs");
const child_process = require("child_process");
const chalk = require('chalk');
let cheerio;
try {
  cheerio = require("cheerio");
} catch (err) {
  console.error(chalk.red("Cheerio is not installed. Installing it now..."));
  child_process.execSync("npm install cheerio", { stdio: "inherit" });
  console.log(chalk.green("Cheerio installed. Rerunning the script..."));
  child_process.execSync("node " + __filename, { stdio: "inherit" });
  process.exit(1);
}
const path = require("path");

let iconCounter = 1;

function toCamelCase(str) {
  return str
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function grabFileNames(title) {
  const files = fs.readdirSync("./");
  const removeNonAlphanumeric =
    title.replace(/[^a-zA-Z0-9]+/g, "") && title.replace(".svg", "");
  const filteredFiles = files.filter((file) => file.endsWith(".svg"));
  return filteredFiles
    .map((file) => toCamelCase(file.replace(".svg", "")))
    .filter((file) => file !== removeNonAlphanumeric);
}

function createComponent(svgPath, components, ...rest) {
  try {
    const svgContent = fs.readFileSync(svgPath, "utf-8");
    const $ = cheerio.load(svgContent, { xmlMode: true });

    const svgElement = $("svg");

    if (!svgElement || svgElement.length === 0) {
      throw new Error(`Invalid SVG file: ${svgPath}`);
    }

    const width = svgElement.attr("width") || "32px";
    const height = svgElement.attr("height") || "32px";
    let title = toCamelCase(svgElement.attr("title") || `Icon${iconCounter++}`);
    const svgHTML = $.xml(svgElement.contents());

    const functionName = grabFileNames(title);

    if (!functionName || functionName.length === 0) {
      throw new Error(`Failed to generate function name for file: ${svgPath}`);
    }

    const exportAll = `export { ${functionName}${
      components.length > 1 ? `, ${components.join(", ")}` : ""
    } };`;

    const formattedCode = `
    function ${functionName}({ height = "${height}", width = "${width}", className, color = "currentColor" , ...rest }) {
      return (
        <svg width={width} height={height} viewBox="${svgElement.attr(
          "viewBox"
        )}" className={className} {...rest}>
          <g fill={color}>
            ${svgHTML}
          </g>
        </svg>
      );
    }
    `;

    return formattedCode + exportAll;
  } catch (error) {
    console.error(`Error processing file: ${svgPath}`);
    console.error(error.message);
    return null;
  }
}

function generateComponents(inputDir, outputDir) {
  try {
    console.log(chalk.blue("Starting component generation process..."));
    if (!fs.existsSync(inputDir)) {
      throw new Error(`Input directory '${inputDir}' does not exist.`);
    }

    const files = fs.readdirSync(inputDir);
    const components = [];

    for (const file of files) {
      if (file.endsWith(".svg")) {
        console.log(chalk.yellow(`Processing SVG file: ${file}`));
        const componentCode = createComponent(
          path.join(inputDir, file),
          components
        );
        if (componentCode) {
          console.log(chalk.green(`Component generated for file: ${file}`));
          components.push(componentCode);
        } else {
          console.log(chalk.red(`Failed to generate component for file: ${file}`));
        }
      }
    }

    const allComponents = components.join("\n\n");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const importName = components.map((component) => {
      return component.split("function ")[1].split("(")[0];
    });

    fs.writeFileSync(path.join(outputDir, "icons.jsx"), allComponents);
    console.log(chalk.blue("Icons generated and written to icons.jsx. 💯💯💯"));
    console.log(chalk("You can now import the icons into your components like so:"));
    console.log(chalk.green(` import { ${importName} } from 'react'

    export default function Homepage() {
      return (
        <${importName} />
      )
    }
    `));
  }
  catch (error) {
    console.error(chalk.red("Error generating components:"));
    console.error(error.message);
  }
}


const inputDirectory = ".";
const outputDirectory = ".";

generateComponents(inputDirectory, outputDirectory);
