const fs = require('fs');
const config = require('./key.json');
const sizeOf = require('image-size');

const tinify = require("tinify");
tinify.key = config.API_KEY;

fs.mkdir('./result', () => {
  // TODO: завернуть в рекурсию
  fs.readdir("./images", (err, pages) => {
    if (err) throw err;
    pages.filter(page => page !== '.DS_Store' && page !== '.gitkeep').map(page => {
      fs.readdir(`./images/${page}`, (err, devices) => {
        if (err) throw err;
        devices.filter(device => device !== '.DS_Store' && device !== '.gitkeep').map(device => {
          fs.readdir(`./images/${page}/${device}`, (err, fileNames) => {
            if (err) throw err;
            fileNames.filter(fileName => fileName !== '.gitkeep').forEach(file => {
              const { width, height, type } = sizeOf(`./images/${page}/${device}/${file}`);
  
              // [страница]_[описание]_[размеры]_[common|desktop|mobile]_[дата].[формат]
              const source = tinify.fromFile(`./images/${page}/${device}/${file}`);
              source.toFile(`./result/${page}_${file.split('.')[0]}_${width}x${height}_${device}_${getDate()}.${type}`);
            })
          })
        })
      })
    })
  });
})

/** Возвращает дату в формате DD-MM-YYYY */
function getDate() {
  const date = new Date();

  return `${updateTime(date.getDate())}-${updateTime(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** Преобразует число или месяц в двухзначное число */
function updateTime (num) {
  return num < 10 ? `0${num}` : num;
}


