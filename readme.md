# Набор инструментов для проверки проекта

- установите зависимости `npm install`
- добавьте в вашу разметку `data-test` метки как в примере `source/index.html`
- положите в папку `source` ваш **исходный** код
- для сборки проекта команда `npm run build`
- собранные файлы в папкe `build`
- команда `npm run test` запускает сервер на `localhost:3000` и затем сравнивает скриншоты с вашей версткой
- результат сравнения находится в `backstop_data/html_report/index.html`
- сервер перезапускает тесты после изменения файлов в папке `build`
- команда `npm run w3c` проверяет валидность html
- команда `npm run linthtml` проверяет html по стайлгайду
- команда `npm run html-validate` проверяет некоторые ошибки по критериям для html
- команда `npm run bemlinter` проверяет дерево БЭМ компонентов
- команда `npm run stylelint` проверяет SCSS
- команда `npm run stylelint-fix` исправляет форматирование SCSS по стайлгайду
- команда `npm run lint-js` проверяет JS
- команда `npm run ls-lint` проверяет названия файлов
- команда `npm run editorconfig` проверяет настройки формата файлов