# image-compressor

Инструмент для оптимизации картинок

## Использование

Получить `API_KEY` на сайте [tinypng.com](https://tinypng.com/developers) и положить его в файл `key.json`. Шаблон находится в корне проекта.

Изображения раскладываются согласно структуре папок, а после оптимизации складываются в папку `result` и именуются согласно шаблону:

`[page]_[file-name]_[widthxheight]_[common|desktop|mobile]_[date].[type]`

### Стуктура папок

```
|-image
  |-page
    |-common
      |-file-name.(png|jpg)
    |-desktop
    |-modile
```

### Результат

```
|-result
  |-iis_portfolio_260x124_desktop_24-04-2020.png
```

## Ограничение

Бесплатный `API_KEY` позволяет оптимизировать до `500` изображений в месяц