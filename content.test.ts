import {afterAll, beforeAll, describe, expect, test} from 'vitest'
import type {PreviewServer} from 'vite'
import {preview} from 'vite'
import type {Browser, ElementHandle, Page} from 'puppeteer'
import {launch} from 'puppeteer'

const PORT = 3000

type Test = { context: string, text: string[] };

const tests: Test[] = [
  {
    context: 'hero',
    text: ['Захватывающие', 'вершины Кавказа', 'сопровождении опытных гидов вы']
  },
  {
    context: 'training',
    text: ['Обучение проводится квалифицированными специалистами', 'Видеть мир', 'внимательный инструктор']
  },
  {
    context: 'about',
    text: ['История компании', 'начали заниматься туризмом', 'Наша цель', 'незабываемые впечатления']
  },
  {
    context: 'reviews',
    text: ['Осенью ходили', 'могу сказать', 'Хороший полноценный', 'Инструктор Федор']
  },
  {
    context: 'adv',
    text: ['Оборудование', 'предоставляем клиентам', 'Безопасность', 'Уделяем внимание']
  },
  {
    context: 'gallery',
    text: ['Добавляйте фото']
  },
  {
    context: 'form',
    text: ['Остались вопросы', 'Заполните форму']
  },
  {
    context: 'footer',
    text: ['любым удобным']
  }
]

describe('CMS ready', async () => {
  let server: PreviewServer
  let browser: Browser

  beforeAll(async () => {
    server = await preview({
      preview: {
        port: PORT,
        // open: true
      },
      build: {
        outDir: 'build'
      },
      configFile: false,
    })
    browser = await launch({headless: true})
  })

  afterAll(async () => {
    await browser.close()
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve())
    })
  })

  const getByText = async ($container: ElementHandle<Element>, text: string) => {
    const [$el] = await $container.$$(`xpath/.//*[text()='${text}']`)
    return $el ?  [$el] :  $container.$$(`xpath/.//*[contains(text(), '${text}')]`)
  }


  async function runViewportTest(viewport: { width: number, height: number }, tests: Test[]) {
    let page: Page;
    beforeAll(async () => {
      page = await browser.newPage()
      await page.setViewport(viewport);
      await page.goto(`http://localhost:${PORT}`, {waitUntil: 'networkidle0'})
    });
    for (const { context: testName, text: elements } of tests) {
      describe(testName, async () => {
        let $container: ElementHandle<Element>;
        beforeAll(async () => {
          $container = await page.$(`[data-test="${testName}"]`);
          if (!$container) {
            throw new Error(`Container with data-test="${testName}" not found`);
          }
        })

        for (const text of elements) {
          test(text, async () => {
            const [$el] = await getByText($container, text);
            if (!$el) {
              throw new Error(`Element with text "${text}" not found in ${testName} container`);
            }
            const classProperties = await page.evaluate(el => {
              return el.classList.length
            }, $el);
            expect(classProperties, 'Элемент не должен иметь CSS-классы').toBe(0);
          })
        }
      });
    }
  }
  describe('content', async () => {
    await runViewportTest({width: 768, height: 800}, tests);
  })
});
