# The List

A static GitHub Pages launcher for HTML and Flash (`.swf`) programs.

## Adding programs and playlists

Each program is a folder named after the program. Put an `index.html`, one `.swf` file, or a `.txt` file containing one web address inside it. For example:

```
programs/
  games/
    playkey.plist       ← makes `games` a playlist/category
    Super Game/
      index.html
    Old Flash Game/
      game.swf
```

Any folder containing an empty file named `playkey.plist` is a playlist/category. Any folder without that marker is treated as an individual program if it contains `index.html` or a `.swf` file. The displayed name comes from the folder name.

A `.txt` launcher file must contain a single `http://` or `https://` URL. Selecting that item loads the link in the player window.

The publishing workflow scans this structure automatically and builds `assets/programs.json`; you never need to edit that file by hand. Playlists appear as folders in the main grid, alongside standalone programs. Select a folder to open it.

## Icons

Put an icon file in `assets/icons/` with the exact same name as a program or playlist folder. For example, `assets/icons/Super Game.png` is used automatically for `programs/games/Super Game/`. Supported formats are SVG, PNG, JPG, GIF, WebP, and ICO. Items without a matching icon use the default file or folder icon.

SWF files are played with Ruffle, a Flash emulator loaded from its hosted script. Compatibility depends on the game; use HTML versions when available.

## Publishing

Create a GitHub repository from this folder and push it to the `main` branch. In **Settings → Pages**, set the source to **GitHub Actions**. Each push will generate the list and deploy the site.

## Testing locally

From this folder, run:

```
npm.cmd test
```

Then open `http://localhost:8080` in your browser. This builds the playlist list from your current folders every time it starts and does not publish or upload anything. Press `Ctrl+C` in the terminal when you are done.
