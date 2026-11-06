import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, basename, extname } from 'node:path';

const root = process.cwd();
const programsRoot = join(root, 'programs');
const iconsRoot = join(root, 'assets', 'icons');
const iconExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico']);
const iconFiles = await readdir(iconsRoot);
const playlists = [];
const programs = [];
const webPath = path => path.replaceAll('\\', '/');
function iconFor(folder, isPlaylist) {
  const name = basename(folder).toLowerCase();
  const match = iconFiles.find(file => basename(file, extname(file)).toLowerCase() === name && iconExtensions.has(extname(file).toLowerCase()));
  return match ? `assets/icons/${match}` : `assets/icons/${isPlaylist ? 'folder.svg' : 'default.svg'}`;
}
async function scan(folder, parentPlaylist = null) {
  const entries = await readdir(folder, { withFileTypes: true });
  const folderId = webPath(relative(programsRoot, folder));
  const isPlaylist = entries.some(entry => entry.isFile() && entry.name === 'playkey.plist');
  if (isPlaylist) {
    playlists.push({ id: folderId, parent: parentPlaylist, name: basename(folder), icon: iconFor(folder, true) });
    for (const entry of entries) if (entry.isDirectory()) await scan(join(folder, entry.name), folderId);
    return;
  }
  const index = entries.find(entry => entry.isFile() && entry.name.toLowerCase() === 'index.html');
  const swf = entries.find(entry => entry.isFile() && extname(entry.name).toLowerCase() === '.swf');
  const urlFile = entries.find(entry => entry.isFile() && extname(entry.name).toLowerCase() === '.txt');
  const file = index || swf || urlFile;
  if (file && folderId) {
    let type = index ? 'html' : swf ? 'swf' : 'url';
    let path = `programs/${webPath(relative(programsRoot, join(folder, file.name)))}`;
    if (type === 'url') {
      path = (await readFile(join(folder, file.name), 'utf8')).trim();
      if (!/^https?:\/\//i.test(path)) type = null;
    }
    if (type) programs.push({ title: basename(folder), playlist: parentPlaylist, type, path, icon: iconFor(folder, false) });
    return;
  }
  for (const entry of entries) if (entry.isDirectory()) await scan(join(folder, entry.name), parentPlaylist);
}
await scan(programsRoot);
await writeFile(join(root, 'assets', 'programs.json'), JSON.stringify({ playlists, programs }, null, 2) + '\n');
console.log(`Built ${programs.length} program(s) in ${playlists.length} playlist(s).`);
