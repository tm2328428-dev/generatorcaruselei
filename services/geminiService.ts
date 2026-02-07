
import { GoogleGenAI, Type } from "@google/genai";
import type { CarouselContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateCarouselTopic(activity: string): Promise<string> {
  // If activity is empty, pick a random popular niche context for the AI
  const nicheContext = activity.trim() 
    ? activity 
    : "Любая популярная ниша в Instagram (Психология, Заработок, Отношения, Здоровье, Саморазвитие)";

  const prompt = `
    Твоя роль: Стратег вирального контента.
    Ниша: "${nicheContext}".
    
    Твоя задача: Сгенерировать ОДИН мощный заголовок, используя одну из 3-х виральных формул (выбери случайно):
    
    1. ФОРМУЛА "ВЗРОСЛЕНИЕ" (Референс: "Запреты родителей, которые я не понимал..."):
       - Структура: "Вещи в [Ниша], которые я раньше игнорировал — а сейчас понял (и благодарен)".
       - Эмоция: Осознание, признание ошибок.
    
    2. ФОРМУЛА "НЕОЧЕВИДНАЯ ЦЕННОСТЬ" (Референс: "Подарки, которые реально укрепляют брак..."):
       - Структура: "Этот список [Действий/Вещей], которые реально [Желанный результат] (Ты обязан их внедрить):".
       - Эмоция: Секретный ингредиент, польза без денег.
    
    3. ФОРМУЛА "ЖЕСТКАЯ ПРАВДА":
       - Структура: "Перестань [Популярное действие]. Это не [Польза], это [Вред]".
       - Эмоция: "Холодный душ", разрушение мифов.

    Требования:
    - Пиши на русском языке.
    - Без кавычек в начале и конце.
    - Максимум 12-14 слов.
    - Должно звучать как личный опыт или инсайд.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 1.1 }, // Higher temperature for more variety when random
    });

    return response.text.trim().replace(/^"|"$/g, '').replace(/\*\*/g, '');
  } catch (error) {
    console.error("Error generating topic:", error);
    throw new Error("Failed to generate topic.");
  }
}

export async function generateCarouselContent(topic: string, numSlides: number, ctaKeyword: string, isExactTitle: boolean = false, ctaType: 'lead_magnet' | 'subscribe' = 'lead_magnet'): Promise<CarouselContent> {
  
  let ctaSpecificInstructions = "";
  if (ctaType === 'lead_magnet') {
      ctaSpecificInstructions = `
          CTA (Final Slide):
          - Title: "ЗАБЕРИ ЭТОТ МАТЕРИАЛ".
          - Description: "Напиши слово '${ctaKeyword}' в директ, чтобы получить гайд/файл".
      `;
  } else {
      ctaSpecificInstructions = `
          CTA (Final Slide):
          - Title: "НЕ ТЕРЯЙСЯ".
          - Description: "Подпишись. Здесь я рассказываю то, о чем другие молчат. Ссылка в шапке профиля."
      `;
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      first_page_title: {
        type: Type.STRING,
        description: "Заголовок обложки.",
      },
      content_pages: {
        type: Type.ARRAY,
        description: `Контент для ${numSlides - 2} слайдов.`,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Заголовок. ОБЯЗАТЕЛЬНО начинай с цифры (1., 2. и т.д.). Пример: '1. Не лезь в чужие драки'.",
            },
            intro_paragraph: {
              type: Type.STRING,
              description: "Строка контраста 'Ожидание — Реальность'. Пример: 'Я думал — трусость. Оказалось — мудрость.' или 'Казалось — жадность. Оказалось — приоритеты.' Если тема не подразумевает контраст, напиши краткий, бьющий в цель тезис.",
            },
            points: {
              type: Type.ARRAY,
              description: "Основной текст. 1-2 абзаца плотного сторителлинга. Конкретные примеры, личные переживания, диалоги. НЕ пиши общие фразы. Текст должен быть 'мясным' как в примерах.",
              items: { type: Type.STRING },
              maxItems: 2, 
            },
            blockquote_text: {
                type: Type.STRING,
                description: "Финальный панчлайн/вывод слайда. 1 короткое, емкое предложение, подводящее черту."
            }
          },
          required: ["title", "intro_paragraph", "points", "blockquote_text"],
        },
      },
      call_to_action_page: {
          type: Type.OBJECT,
          properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
          },
          required: ["title", "description"]
      }
    },
    required: ["first_page_title", "content_pages", "call_to_action_page"],
  };

  const prompt = `
    Твоя роль: Автор с сильным личным брендом (архетип: Мудрец/Бунтарь).
    Задача: Написать контент для карусели: "${topic}".
    
    АНАЛИЗ СТИЛЯ (На основе референсов):
    1. **Структура**: Каждый слайд — это отдельная микро-история или инсайд.
    2. **Контраст (Intro)**: Идеально, если ты используешь формат "Думал X -> Оказалось Y". Это создает драматургию.
    3. **Текст (Points)**: 
       - Используй рубленые фразы. 
       - Добавляй диалоги (пример: "Отец сказал: «Не твоя война...»").
       - Избегай канцеляризмов ("является", "осуществляет"). Пиши разговорно, но жестко.
       - Текста должно быть достаточно, чтобы погрузить читателя (40-60 слов на слайд).
    
    ${ctaSpecificInstructions}

    Если isExactTitle = true, первый слайд должен быть равен в точности "${topic}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85, 
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content.");
  }
}
