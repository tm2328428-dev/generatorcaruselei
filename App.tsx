
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateCarouselContent, generateCarouselTopic } from './services/geminiService';
import type { CarouselContent, CarouselPage, CallToActionPage, CarouselDesign, UserProfile } from './types';
import { CarouselSlide } from './components/CarouselSlide';
import { Spinner } from './components/Spinner';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { DesignPicker } from './components/DesignPicker';
import { TelegramIcon } from './components/icons/TelegramIcon';
import { TelegramSettingsModal } from './components/TelegramSettingsModal';
import { UploadIcon } from './components/icons/UploadIcon';
import { DoodleArrowIcon } from './components/icons/DoodleArrowIcon';

declare const htmlToImage: any;
declare const JSZip: any;

const PREVIEW_CONTENT: CarouselContent = {
  first_page_title: "Запреты родителей, которые я раньше НЕ ПОНИМАЛ — а сейчас ПОНЯЛ (и благодарен за них):",
  content_pages: [
    {
      title: "1. «Не лезь в чужие драки»",
      intro_paragraph: "Я думал — учат быть трусом. Оказалось — учат думать.",
      points: [
        "В 15 хотелось быть героем, вписаться за друга, показать, что не слабак. А отец говорил: «Не твоя война — не твоя рана». Тогда злился.",
        "Сейчас понимаю: он видел, как чужой конфликт ломает чужие жизни. Храбрость — это не лезть куда угодно. Храбрость — это знать, за что стоит платить."
      ],
      blockquote_text: "Не путай отвагу с глупостью."
    },
    {
      title: "2. «Сначала профессия — потом машина»",
      intro_paragraph: "Казалось — жадность. Оказалось — приоритеты.",
      points: [
        "Все вокруг брали кредиты, гоняли на тонированных, чувствовали себя королями. Отец сказал: «Машина теряет цену, пока ты спишь. Навык — растет».",
        "Я послушал не сразу. Но те, кто начал с машин, до сих пор на тех же должностях. А те, кто вложился в голову — давно пересели на класс выше."
      ],
      blockquote_text: "Инвестируй в себя, железо подождет."
    },
    {
        title: "3. «Не веди в дом кого попало»",
        intro_paragraph: "Думал — контроль. Понял — фильтр.",
        points: [
            "Дом — это территория. Кого впускаешь — тот влияет. На атмосферу, на решения, на твоё ощущение себя. Родители не запрещали дружить.",
            "Они учили: не каждый заслуживает видеть, как ты живёшь. Некоторых держи на дистанции — не из высокомерия, а из уважения к своему пространству."
        ],
        blockquote_text: "Твой дом — твоя крепость, а не проходной двор."
    }
  ],
  call_to_action_page: {
    title: "И ПОСЛЕДНЕЕ...",
    description: "Написал статью про сепарацию от родителей. Пиши «РОДИТЕЛИ», скину в директ."
  }
};

type Slide = 
    | ({ type: 'first' } & { title: string })
    | ({ type: 'content' } & CarouselPage)
    | ({ type: 'cta' } & CallToActionPage);

type CTAType = 'lead_magnet' | 'subscribe';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [ctaType, setCtaType] = useState<CTAType>('lead_magnet');
  const [ctaKeyword, setCtaKeyword] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [numSlides, setNumSlides] = useState<number>(5);
  const [carouselContent, setCarouselContent] = useState<CarouselContent | null>(PREVIEW_CONTENT);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [selectedDesign, setSelectedDesign] = useState<CarouselDesign>('influencer');
  
  const [isCustomTitle, setIsCustomTitle] = useState<boolean>(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
      name: 'Nika | 10x',
      handle: '@nika_ai.lab',
      avatarUrl: null
  });

  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix for html-to-image errors reading remote stylesheets (CORS)
  useEffect(() => {
      const inlineGoogleFonts = async () => {
          // Find Google Fonts stylesheet
          const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
          for (const link of Array.from(links)) {
              if (link instanceof HTMLLinkElement && link.rel === 'stylesheet') {
                  try {
                      // Fetch the CSS content
                      const response = await fetch(link.href);
                      if (response.ok) {
                          const css = await response.text();
                          // Create a style element with the content
                          const style = document.createElement('style');
                          style.textContent = css;
                          document.head.appendChild(style);
                          // Remove the original link to prevent html-to-image from accessing it
                          link.remove();
                      }
                  } catch (e) {
                      console.warn('Failed to inline Google Fonts CSS:', e);
                  }
              }
          }
      };
      inlineGoogleFonts();
  }, []);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUserProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUpdateContent = (slideIndex: number, field: string, value: any) => {
      if (!carouselContent) return;
      const newContent = { ...carouselContent };
      
      if (slideIndex === 0) {
          if (field === 'title') newContent.first_page_title = value;
      } else if (slideIndex === slides.length - 1) {
          if (field === 'ctaTitle') newContent.call_to_action_page.title = value;
          if (field === 'ctaDescription') newContent.call_to_action_page.description = value;
      } else {
          const contentIndex = slideIndex - 1;
          if (newContent.content_pages[contentIndex]) {
              if (field === 'title') newContent.content_pages[contentIndex].title = value;
              if (field === 'intro_paragraph') newContent.content_pages[contentIndex].intro_paragraph = value;
              if (field === 'points') newContent.content_pages[contentIndex].points = value;
              if (field === 'blockquote_text') newContent.content_pages[contentIndex].blockquote_text = value;
          }
      }
      setCarouselContent(newContent);
  };

  const handleGenerateTopic = async () => {
    // We no longer require activity to be present. If empty, the service picks a random one.
    setIsGeneratingTopic(true);
    setError(null);
    try {
      const generatedTopic = await generateCarouselTopic(activity);
      setTopic(generatedTopic);
      setIsCustomTitle(false); // Reset to "Idea" mode so AI generates the content
    } catch (err) {
      setError('Ошибка генерации темы.');
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic) return setError('Введите тему.');
    if (ctaType === 'lead_magnet' && !ctaKeyword) return setError('Введите CTA слово.');
    
    setIsLoading(true);
    setError(null);
    setCarouselContent(null);
    setIsGenerated(true);
    try {
      const content = await generateCarouselContent(topic, numSlides, ctaKeyword, isCustomTitle, ctaType);
      
      // FORCE OVERRIDE: If the user provided a custom title, use it exactly as is.
      // This bypasses any AI shortening/paraphrasing.
      if (isCustomTitle) {
        content.first_page_title = topic;
      }

      setCarouselContent(content);
    } catch (err) {
      setError('Ошибка генерации контента.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadSlide = useCallback(async (element: HTMLDivElement, filename: string) => {
    try {
        // Increased pixelRatio to 3 for high resolution (1125px width)
        const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error downloading', error);
    }
  }, []);

  const handleDownloadSlide = useCallback(async (index: number) => {
      const slideElement = slideRefs.current[index];
      if (slideElement) await downloadSlide(slideElement, `slide-${index + 1}.png`);
  }, [downloadSlide]);

  const handleDownloadAll = useCallback(async () => {
    if (!carouselContent) return;
    setIsZipping(true);
    try {
        const zip = new JSZip();
        const slideElements = slideRefs.current.filter(el => el !== null) as HTMLDivElement[];
        for (let i = 0; i < slideElements.length; i++) {
            // Increased pixelRatio to 3
            const dataUrl = await htmlToImage.toPng(slideElements[i], { quality: 1.0, pixelRatio: 3 });
            zip.file(`slide-${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
        }
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'carousel.zip';
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        setError('Ошибка создания архива.');
    } finally {
        setIsZipping(false);
    }
  }, [carouselContent]);

  const handleSendToTelegram = useCallback(async (token: string, chatId: string) => {
    if (!carouselContent) return;
    setIsSendingTelegram(true);
    setError(null);
    try {
        const slideElements = slideRefs.current.filter(el => el !== null) as HTMLDivElement[];
        const blobs: Blob[] = [];
        for (let i = 0; i < slideElements.length; i++) {
             // High resolution settings: pixelRatio 3, Max Quality
             const dataUrl = await htmlToImage.toPng(slideElements[i], { quality: 1.0, pixelRatio: 3 });
             const byteString = atob(dataUrl.split(',')[1]);
             const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
             const ab = new ArrayBuffer(byteString.length);
             const ia = new Uint8Array(ab);
             for (let j = 0; j < byteString.length; j++) { ia[j] = byteString.charCodeAt(j); }
             blobs.push(new Blob([ab], {type: mimeString}));
        }
        const formData = new FormData();
        formData.append('chat_id', chatId.trim());
        // Telegram sends as "photo" by default which compresses, but high-res input helps significantly.
        // We send as media group (album).
        const mediaItems = blobs.map((_, index) => ({ type: 'photo', media: `attach://slide-${index}` }));
        formData.append('media', JSON.stringify(mediaItems));
        blobs.forEach((blob, index) => formData.append(`slide-${index}`, blob, `slide-${index}.png`));
        
        const response = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMediaGroup`, { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.description || 'Error');
        setIsTelegramModalOpen(false);
        alert('Отправлено в высоком качестве! 🚀');
    } catch (error: any) {
        setError(`Ошибка Telegram: ${error.message}`);
    } finally {
        setIsSendingTelegram(false);
    }
  }, [carouselContent]);

  const slides: Slide[] = carouselContent ? [
    { type: 'first', title: carouselContent.first_page_title },
    ...carouselContent.content_pages.map(page => ({ type: 'content' as const, ...page })),
    { type: 'cta', ...carouselContent.call_to_action_page }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-purple-500/30">
        
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]"></div>
         <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
      </div>

      <TelegramSettingsModal 
        isOpen={isTelegramModalOpen} 
        onClose={() => setIsTelegramModalOpen(false)} 
        onSend={handleSendToTelegram}
        isSending={isSendingTelegram}
      />
      
      <div className="relative z-10 flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="w-full lg:w-[400px] bg-[#13161c]/80 backdrop-blur-md border-r border-white/5 p-6 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
            <header className="mb-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    AI Carousel
                </h1>
                <p className="text-xs text-gray-500">v2.7 Smart Gen</p>
            </header>

            {/* Profile Card */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center cursor-pointer overflow-hidden border border-gray-600 group relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl">📷</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <UploadIcon />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    <div className="flex-1 space-y-1">
                        <input 
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 text-sm font-medium focus:outline-none px-1"
                            placeholder="Ваше Имя"
                        />
                        <input 
                            value={userProfile.handle}
                            onChange={(e) => setUserProfile({...userProfile, handle: e.target.value})}
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 text-xs text-gray-400 focus:outline-none px-1"
                            placeholder="@username"
                        />
                    </div>
                </div>
            </div>

            {/* Generation Form */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">1. Ниша</label>
                    <input 
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="SMM, Нутрициолог (или пусто для рандома)..."
                    />
                    <button 
                        onClick={handleGenerateTopic}
                        disabled={isGeneratingTopic}
                        className="w-full mt-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-purple-500/50 text-purple-300 hover:text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                        {isGeneratingTopic ? <Spinner /> : <>
                            <span className="group-hover:rotate-12 transition-transform text-lg">🎲</span> 
                            {activity ? 'Придумать тему для этой ниши' : 'Мне повезет / Случайная тема'}
                        </>}
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                         <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">2. Тема</label>
                         <div className="flex bg-gray-800 rounded-lg p-0.5">
                             <button 
                                onClick={() => setIsCustomTitle(false)}
                                className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${!isCustomTitle ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                             >
                                Идея
                             </button>
                             <button 
                                onClick={() => setIsCustomTitle(true)}
                                className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${isCustomTitle ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                             >
                                Готовый заголовок
                             </button>
                         </div>
                    </div>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none h-20"
                        placeholder={isCustomTitle ? "Вставьте сюда готовый заголовок. AI перенесет его на слайд без изменений..." : "О чем пишем сегодня? (AI придумает креативный заголовок)"}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Количество слайдов</label>
                         <div className="relative">
                             <select
                                value={numSlides}
                                onChange={(e) => setNumSlides(Number(e.target.value))}
                                className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none transition-all cursor-pointer"
                             >
                                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num} слайдов</option>
                                ))}
                             </select>
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                                 ▼
                             </div>
                         </div>
                    </div>
                    
                    {/* CTA Type Selector */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Тип финала</label>
                         <div className="flex bg-[#0a0c10] border border-gray-700 rounded-lg p-1">
                             <button 
                                onClick={() => setCtaType('lead_magnet')}
                                className={`flex-1 py-1.5 text-[10px] rounded transition-all ${ctaType === 'lead_magnet' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                             >
                                Лид-магнит
                             </button>
                             <button 
                                onClick={() => setCtaType('subscribe')}
                                className={`flex-1 py-1.5 text-[10px] rounded transition-all ${ctaType === 'subscribe' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                             >
                                Подписка
                             </button>
                         </div>
                    </div>
                </div>

                {/* Conditional CTA Keyword Input */}
                {ctaType === 'lead_magnet' && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CTA Слово</label>
                        <input
                            value={ctaKeyword}
                            onChange={(e) => setCtaKeyword(e.target.value)}
                            className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none animate-fadeIn"
                            placeholder="ГАЙД"
                        />
                    </div>
                )}
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/30 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Spinner /> <span>Анализирую...</span>
                        </div>
                    ) : 'Сгенерировать'}
                </button>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>}
            </div>

            <div className="border-t border-white/5 pt-6">
                 <DesignPicker selectedDesign={selectedDesign} onSelectDesign={setSelectedDesign} />
            </div>
            
            {carouselContent && (
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                    <button onClick={handleDownloadAll} disabled={isZipping} className="bg-green-600/90 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                        {isZipping ? <Spinner /> : <><DownloadIcon /> ZIP</>}
                    </button>
                    <button onClick={() => setIsTelegramModalOpen(true)} className="bg-[#24A1DE]/90 hover:bg-[#24A1DE] text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                         <TelegramIcon /> Telegram
                    </button>
                </div>
            )}
        </div>

        {/* RIGHT CONTENT: PREVIEW */}
        <div className="flex-1 overflow-y-auto bg-black/20 custom-scrollbar p-8 lg:p-12">
            {!isGenerated && carouselContent && (
                <div className="max-w-2xl mx-auto text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Предпросмотр</h2>
                    <p className="text-gray-400 text-sm">Кликните на любой текст на слайде, чтобы отредактировать его.</p>
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-8 pb-20">
                {slides.map((slide, index) => (
                    <div key={index} className="group relative">
                        <div 
                            ref={el => { slideRefs.current[index] = el; }} 
                            className="transition-transform duration-300 shadow-2xl group-hover:scale-[1.01] group-hover:shadow-purple-500/10"
                        >
                            <CarouselSlide
                                design={selectedDesign}
                                userProfile={userProfile}
                                isFirstPage={slide.type === 'first'}
                                isCtaPage={slide.type === 'cta'}
                                title={slide.type !== 'cta' ? slide.title : undefined}
                                intro_paragraph={slide.type === 'content' ? slide.intro_paragraph : undefined}
                                points={slide.type === 'content' ? slide.points : undefined}
                                blockquote_text={slide.type === 'content' ? slide.blockquote_text : undefined}
                                ctaTitle={slide.type === 'cta' ? slide.title : undefined}
                                ctaDescription={slide.type === 'cta' ? slide.description : undefined}
                                slideIndex={index}
                                totalSlides={slides.length}
                                onUpdateContent={(field, value) => handleUpdateContent(index, field, value)}
                            />
                        </div>
                        <button
                            onClick={() => handleDownloadSlide(index)}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            <DownloadIcon /> PNG
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
