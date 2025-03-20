// build-styles.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const postcss = require('postcss');
const cssnano = require('cssnano');
const sass = require('sass');

const stylesDir = './src/styles';
const outputDir = './assets';

// Найти все .css и .scss файлы, исключая main.css
const files = glob.sync(`${stylesDir}/**/*.{css,scss}`, {
  ignore: [`${stylesDir}/main.css`],
});

files.forEach((file) => {
  const ext = path.extname(file);
  const relativePath = path.relative(stylesDir, file);
  const baseName = relativePath.replace(ext, '').replace(/[/\\]/g, '-');
  const outputFileName = `${baseName}.min.css`;
  const outputPath = path.join(outputDir, outputFileName);

  let cssContent;

  if (ext === '.scss') {
    // Компилируем SCSS в CSS
    const result = sass.renderSync({ file });
    cssContent = result.css.toString();
  } else {
    // Читаем содержимое CSS файла
    cssContent = fs.readFileSync(file, 'utf-8');
  }

  // Минифицируем CSS с помощью PostCSS и cssnano
  postcss([cssnano])
    .process(cssContent, { from: undefined })
    .then((result) => {
      fs.writeFileSync(outputPath, result.css);
      console.log(`Processed: ${outputPath}`);
    })
    .catch((err) => {
      console.error(`Error processing ${file}:`, err);
    });
});
