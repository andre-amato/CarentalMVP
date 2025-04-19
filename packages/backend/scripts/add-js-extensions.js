import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = join(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype
    .concat(...files)
    .filter((file) => file.endsWith('.js'));
}

async function fixImports(file) {
  const content = await readFile(file, 'utf8');

  const newContent = content.replace(
    /from ['"]([^'"]*)['"]/g,
    (match, path) => {
      if (path.startsWith('.') && !path.endsWith('.js')) {
        return `from '${path}.js'`;
      }
      return match;
    }
  );

  await writeFile(file, newContent, 'utf8');
}

async function main() {
  try {
    const files = await getFiles(distDir);
    console.log(`Processing ${files.length} files...`);

    await Promise.all(files.map(fixImports));

    console.log('All files processed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
