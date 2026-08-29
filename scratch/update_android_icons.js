const fs = require('fs');
const path = require('path');

const iconSource = path.join(__dirname, '..', 'src', 'app', 'icon.png');
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

const mipmapFolders = [
  'mipmap-hdpi',
  'mipmap-mdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

const iconFiles = [
  'ic_launcher.png',
  'ic_launcher_round.png',
  'ic_launcher_foreground.png'
];

mipmapFolders.forEach(folder => {
  const targetFolder = path.join(resDir, folder);
  if (fs.existsSync(targetFolder)) {
    iconFiles.forEach(file => {
      const dest = path.join(targetFolder, file);
      fs.copyFileSync(iconSource, dest);
      console.log(`Copiado: ${folder}/${file}`);
    });
  }
});

console.log('✅ Todos os ícones do aplicativo Android foram atualizados com o logo oficial!');
