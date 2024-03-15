const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

let iconCounter = 1;

function toCamelCase(str) {
  return str.split(/[^a-zA-Z0-9]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function grabFileNames(title) {
  const files = fs.readdirSync('./');
  const removeNonAlphanumeric = title.replace(/[^a-zA-Z0-9]+/g, '') && title.replace('.svg', '');
  const filteredFiles = files.filter(file => file.endsWith('.svg'));
  return filteredFiles.map(file => toCamelCase(file.replace('.svg', ''))).filter(file => file !== removeNonAlphanumeric);
}
function createComponent(svgPath, components, ...rest) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const $ = cheerio.load(svgContent, { xmlMode: true });

    const svgElement = $('svg');

    const width = svgElement.attr('width') || '32px';
    const height = svgElement.attr('height') || '32px';
    let title = toCamelCase(svgElement.attr('title') || `Icon${iconCounter++}`);
    const svgHTML = $.xml(svgElement.contents());

    const functionName = grabFileNames(title);    const exportAll = `export { ${functionName}${components.length > 1 ? `, ${components.join(', ')}` : ''} };`;

    const formattedCode = `
    function ${functionName}({ height = "${height}", width = "${width}", className, color, ...rest }) {
      return (
        <svg width={width} height={height} viewBox="${svgElement.attr('viewBox')}" className={className} {...rest}>
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
        const componentCode = createComponent(path.join(inputDir, file), components);
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
