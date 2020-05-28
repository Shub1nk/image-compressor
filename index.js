const fs = require("fs");
const sizeOf = require("image-size");
const translitRusEng = require("translit-rus-eng");
const tinify = require("tinify");
const glob = require("glob");
const { promisify } = require("util");
const config = require("./key.json");

const copyFileAsync = promisify(fs.copyFile);
tinify.key = config.API_KEY;

makeIfNotExists("./result");

glob("./images/**/*.png", {}, async (err, files) => {
  await compressImage(files, ".png");
});
glob("./images/**/*.jpg", {}, async (err, files) => {
  await compressImage(files, ".jpg");
});

/** Оптимизирует картинки используют сервис https://tinypng.com */
async function compressImage(filesArr, fileType) {
  console.log(`Total: ${filesArr.length} ${fileType} images`);

  for await (let path of filesArr) {
    const { width, height, type } = sizeOf(path);
    const [, , page, device, fileName] = path.split("/");

    /**
     * Транслит имени файла
     * replace после транслита необходим т.к. мино не переваривает эти символы
     */
    const preparedFileName = translitRusEng(fileName.split(".")[0], {
      slug: true,
      lowerCase: true,
    })
      .replace(/(_)/g, "-")
      .replace(/ĭ/g, "i")
      .replace(/%̆/g, "pc");

    if (!fs.existsSync("./result/desktop")) {
      fs.mkdirSync("./result/desktop");
    }

    if (!fs.existsSync("./result/mobile")) {
      fs.mkdirSync("./result/mobile");
    }

    // result/[устройство]/[страница]_[описание]_[размеры]_[common|desktop|mobile]_[дата].[формат]
    const resultFilePath = `./result/${device}/${page}_${preparedFileName}_${width}x${height}_${device}_${getDate()}.${type}`;

    // Перенос файла с новым названием и его сжатие
    fs.copyFile(path, resultFilePath, async (err) => {
      if (err) throw err;

      await tinify.fromFile(resultFilePath).toFile(resultFilePath);
    });
  }
}

/** Возвращает дату в формате DD-MM-YYYY */
function getDate() {
  const date = new Date();

  return `${updateTime(date.getDate())}-${updateTime(
    date.getMonth() + 1
  )}-${date.getFullYear()}`;
}

/** Преобразует число или месяц в двухзначное число */
function updateTime(num) {
  return num < 10 ? `0${num}` : num;
}

function makeIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
