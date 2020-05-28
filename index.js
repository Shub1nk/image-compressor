const fs = require("fs");
const config = require("./key.json");
const sizeOf = require("image-size");
const translitRusEng = require("translit-rus-eng");

const tinify = require("tinify");
tinify.key = config.API_KEY;

// Массив с путями до картинок
const pathsArr = [];
const START_DIRECTORY = "./images";

fs.mkdir("./result", () => compressImage());

/** Оптимизирует картинки используют сервис https://tinypng.com */
function compressImage() {
  pathAggregator(START_DIRECTORY);

  console.log(`Total: ${pathsArr.length} images`);

  pathsArr.forEach((path) => {
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
    const resultFileCompress = tinify.fromFile(path);

    // Перенос файла с новым названием
    fs.copyFile(path, resultFilePath, (err) => {
      if (err) throw err;
      console.log(`${path} was copied`);
    });

    // Сжатие изображений
    resultFileCompress
      .toFile(resultFilePath)
      .then(() => console.log(`file: ${path} file is optimized`));
  });
}

/** Рекурсивно проходит вглубь папки и собирает путь до файла */
function pathAggregator(path) {
  if (fs.lstatSync(path).isDirectory()) {
    const essencies = fs
      .readdirSync(path)
      .filter((item) => item !== ".DS_Store" && item !== ".gitkeep");
    essencies.forEach((essence) => {
      if (!fs.lstatSync(`${path}/${essence}`).isDirectory()) {
        const typeFile = `${path}/${essence}`.split(".")[2];
        if (typeFile === "png" || typeFile === "jpg") {
          pathsArr.push(`${path}/${essence}`);
        }
      }
      pathAggregator(`${path}/${essence}`);
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
