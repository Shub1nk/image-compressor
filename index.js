const fs = require('fs');
const config = require('./key.json');
const sizeOf = require('image-size');

const tinify = require("tinify");
tinify.key = config.API_KEY;

// TODO: завернуть в функцию ---------------
const date = new Date()
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();


const dayUpdate = day < 10 ? `0${day}` : day;
const monthUpdate = month < 10 ? `0${month}` : month;
// -----------------------------------------

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
              source.toFile(`./result/${page}_${file.split('.')[0]}_${width}x${height}_${device}_${dayUpdate}-${monthUpdate}-${year}.${type}`);
            })
          })
        })
      })
    })
  });

})



