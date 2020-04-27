const fs = require('fs');
const config = require('./key.json');
const sizeOf = require('image-size');

const tinify = require("tinify");
tinify.key = config.API_KEY;

// Массив с путями до картинок
const patchsArr = [];
const START_DIRECORY = './images'

fs.mkdir('./result', () => compressImage())

/** Оптимизирует картинки используют сервис https://tinypng.com */
function compressImage () {

  patchAggregator(START_DIRECORY);

  console.log(`Total: ${patchsArr.length} images`)

  patchsArr.forEach(patch => {
    const { width, height, type } = sizeOf(patch);
    const [, , page, device, fileName] = patch.split('/');
  
    // [страница]_[описание]_[размеры]_[common|desktop|mobile]_[дата].[формат]
    const source = tinify.fromFile(patch);
    source.toFile(`./result/${page}_${fileName.split('.')[0]}_${width}x${height}_${device}_${getDate()}.${type}`)
      .then(() => console.log(`file: ${patch} file is optimized`));
    
  });
}

/** Рекурсивно проходит вглубь папки и собирает путь до файла */
function patchAggregator (patch) {
  if (fs.lstatSync(patch).isDirectory()) {
    const essencies = fs.readdirSync(patch).filter(item => item !== '.DS_Store' && item !== '.gitkeep');
    essencies.forEach(essence => {
      if (!fs.lstatSync(`${patch}/${essence}`).isDirectory()) {
        const typeFile = `${patch}/${essence}`.split('.')[2];
        if (typeFile === 'png' || typeFile === 'jpg') {
          patchsArr.push(`${patch}/${essence}`)
        }
      }
      patchAggregator(`${patch}/${essence}`)
    });
  }
}

/** Возвращает дату в формате DD-MM-YYYY */
function getDate() {
  const date = new Date();

  return `${updateTime(date.getDate())}-${updateTime(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** Преобразует число или месяц в двухзначное число */
function updateTime (num) {
  return num < 10 ? `0${num}` : num;
}


