const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

let iconCounter = 1;

function titleToFunctionName(title) {
  return title.replace(/[^a-zA-Z0-9]+/g, '') // Remove non-alphanumeric characters
              .replace(/^(.)?([A-Z])/g, (match, $1, $2) => $1 ? $1.toUpperCase() + $2.toLowerCase() : $2.toUpperCase()) // Convert to camelCase
              .slice(0, 1).toLowerCase() + title.slice(1); // Lowercase first letter
}

function createComponent(svgPath) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const $ = cheerio.load(svgContent, { xmlMode: true }); // Setting xmlMode to true

    const svgElement = $('svg');

    // Extract attributes and title (if available)
    const width = svgElement.attr('width') || '24px';
    const height = svgElement.attr('height') || '24px';
    let title = svgElement.find('title').text().trim().replace(/\s+/g, ''); // Strip spaces from title

    // If title is empty, use a generic name with a titrating number
    if (!title) {
      title = `Icon${iconCounter++}`;
    }

    // Construct function name
    const functionName = titleToFunctionName(title) + 'Icon';

    // Get the SVG content without wrapping it
    const svgHTML = $.html(svgElement.children());

    // Generate formatted code
    const formattedCode = `
      function ${functionName}() {
        return (
          <svg className="" width="${width}" height="${height}" title="${title}">
            ${svgHTML}
          </svg>
        );
      }
    `;
    return formattedCode;
  } catch (error) {
    console.error(`Error processing file: ${svgPath}`);
    console.error(error);
    return null;
  }
}

function generateComponents(inputDir, outputDir) {
  try {
    if (!fs.existsSync(inputDir)) {
      throw new Error(`Input directory '${inputDir}' does not exist.`);
    }

    const files = fs.readdirSync(inputDir);
    const components = [];

    for (const file of files) {
      if (file.endsWith('.svg')) {
        const componentCode = createComponent(path.join(inputDir, file));
        if (componentCode) {
          components.push(componentCode);
        }
      }
    }

    const allComponents = components.join('\n\n');

    // Write components to the output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'icons.jsx'), allComponents);
    console.log('Icons generated and written to icons.jsx');
  } catch (error) {
    console.error('Error generating components:');
    console.error(error.message);
  }
}

// Custom input and output directories
const inputDirectory = '.';
const outputDirectory = '.';

generateComponents(inputDirectory, outputDirectory);
