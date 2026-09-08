# deresute-card-archiver
This is a small script that will pull all THE iDOLM@STER CINDERELLA GIRLS STARLIGHT STAGE Mobile Game Card Data Assets Bundle (.unity3d) for archiving purpose.

## Prerequisite
- Git
- Bun / Node.js Runtime

## Installation
- Clone the repository
```bash
git clone https://github.com/FukutoTojido/deresuta-card-archiver.git
```

- Download the SQLite Database files from [Releases](https://github.com/FukutoTojido/deresuta-card-archiver/releases/latest) and put the files in `data` folder.

- Move to project directory
```bash
cd cgss-super-project
```

- Install all packages first
```bash
bun install
```

## Run the script
- Simply run the script by using this command
```bash
bun index.ts
```

- The output will be in the `output` folder

## Resources
- [https://starlight.kirara.ca](https://starlight.kirara.ca): API for Card Data
- [mishiro-core](https://github.com/toyobayashi/mishiro-core): Download implementation reference
