let programs = [];
let playlists = [];
let activePlaylist = null;
const list = document.querySelector('#program-list');
const title = document.querySelector('#category-title');
const breadcrumbs = document.querySelector('#breadcrumbs');
const exitPlaylist = document.querySelector('#exit-playlist');
const dialog = document.querySelector('#player');
const content = document.querySelector('#player-content');
const fullscreenPlayer = document.querySelector('#fullscreen-player');

function itemsFor(playlist) {
  return { playlists: playlists.filter(item => item.parent === playlist), programs: programs.filter(item => item.playlist === playlist) };
}
function renderBreadcrumbs() {
  breadcrumbs.replaceChildren();
  const trail = [];
  let current = activePlaylist;
  
}

function card(item, isPlaylist) {
  const button = document.createElement('button'); button.className = 'program';
  const icon = document.createElement('img'); icon.src = item.icon; icon.alt = '';
  const name = document.createElement('h3'); name.textContent = item.name || item.title;
  button.append(icon, name);
  button.addEventListener('click', () => isPlaylist ? (activePlaylist = item.id, render()) : openProgram(item));
  return button;
}
function render() {
  const current = playlists.find(item => item.id === activePlaylist);
  title.textContent = current?.name || 'Game Bank';
  exitPlaylist.hidden = !activePlaylist;
  renderBreadcrumbs(); list.replaceChildren();
  const items = itemsFor(activePlaylist);
  [...items.playlists.map(item => card(item, true)), ...items.programs.map(item => card(item, false))].forEach(item => list.append(item));
  if (!list.childElementCount) list.textContent = 'This folder is empty.';
}
function openProgram(item) {
  document.querySelector('#player-title').textContent = item.title; unloadPlayer();
  if (item.type === 'html' || item.type === 'url') { const frame = document.createElement('iframe'); frame.src = item.path; frame.title = item.title; frame.allowFullscreen = true; content.append(frame); }
  else {
    const ruffle = window.RufflePlayer?.newest?.();
    if (!ruffle) {
      content.textContent = 'Ruffle could not load. Check your internet connection and reload the page.';
      return;
    }
    const player = ruffle.createPlayer();
    content.append(player);
    player.ruffle().load(item.path).catch(() => {
      content.textContent = 'This SWF file could not be loaded.';
    });
  }
  dialog.showModal();
}
function unloadPlayer() {
  const loadedFile = content.firstElementChild;
  if (loadedFile instanceof HTMLIFrameElement) loadedFile.src = 'about:blank';
  content.replaceChildren();
}
document.querySelector('#close-player').addEventListener('click', () => dialog.close());
fullscreenPlayer.addEventListener('click', () => {
  const loadedFile = content.firstElementChild;
  if (!loadedFile) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else loadedFile.requestFullscreen?.().catch(() => {});
});
exitPlaylist.addEventListener('click', () => { activePlaylist = null; render(); });
dialog.addEventListener('close', () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  unloadPlayer();
});
fetch('assets/programs.json').then(response => response.ok ? response.json() : Promise.reject(response))
  .then(manifest => { programs = manifest.programs; playlists = manifest.playlists; render(); })
  .catch(() => { list.textContent = 'The program list has not been built yet.'; });
