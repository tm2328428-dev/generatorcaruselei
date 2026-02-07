
import React, { useState, useEffect, useRef } from 'react';
import type { CarouselDesign, UserProfile } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { MoreHorizontalIcon } from './icons/MoreHorizontalIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { SaveIcon } from './icons/SaveIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';

interface CarouselSlideProps {
  design: CarouselDesign;
  userProfile: UserProfile;
  isFirstPage?: boolean;
  isCtaPage?: boolean;
  title?: string;
  intro_paragraph?: string;
  points?: string[];
  blockquote_text?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  slideIndex: number;
  totalSlides: number;
  onUpdateContent: (field: string, value: any) => void;
}

const EditableText: React.FC<{
    value: string;
    onChange: (val: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}> = ({ value, onChange, className, style, placeholder }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => { resize(); }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { onChange(e.target.value); resize(); }}
            rows={1}
            placeholder={placeholder}
            className={`bg-transparent border-none outline-none resize-none overflow-hidden w-full p-0 m-0 focus:ring-1 focus:ring-dashed focus:ring-gray-400/50 rounded-sm ${className}`}
            style={style}
        />
    );
};

// --- 1. JOURNAL DESIGN (iOS Style) ---
const JournalSlide: React.FC<Omit<CarouselSlideProps, 'design'>> = (props) => {
    const { isFirstPage, isCtaPage, title, intro_paragraph, points, blockquote_text, ctaTitle, ctaDescription, onUpdateContent } = props;
    
    return (
        <div className="w-[375px] h-[469px] bg-white text-[#1c1c1e] font-sans overflow-hidden relative flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 relative z-10 shrink-0">
                <div className="flex items-center gap-1 text-[#E0B038]">
                    <ArrowLeftIcon />
                    <span className="text-[17px] font-normal leading-none">Назад</span>
                </div>
                 <div className="flex items-center space-x-5 text-[#E0B038]">
                     <div className="border border-[#E0B038] rounded-full w-6 h-6 flex items-center justify-center text-xs">
                         <span className="transform -rotate-90">↺</span>
                     </div>
                     <div className="border border-[#E0B038] rounded-full w-6 h-6 flex items-center justify-center text-xs">
                         <span className="transform rotate-90">↻</span>
                     </div>
                     <UploadIcon />
                     <div className="border border-[#E0B038] rounded-full w-6 h-6 flex items-center justify-center font-bold text-[10px] leading-none pb-1">
                        ...
                     </div>
                 </div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col relative z-10 font-['Inter'] overflow-hidden">
                {isFirstPage ? (
                    <div className="flex flex-col h-full justify-start pt-4">
                        <EditableText 
                            value={title || ''} 
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-[24px] font-bold leading-[1.2] text-[#1c1c1e] tracking-tight mb-4 font-['Inter']"
                        />
                        <div className="w-full h-px bg-gray-200 mb-6"></div>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Пролистай вправо →</span>
                    </div>
                ) : isCtaPage ? (
                     <div className="flex flex-col h-full justify-center items-center text-center">
                        <EditableText 
                             value={ctaTitle || ''}
                             onChange={(val) => onUpdateContent('ctaTitle', val)}
                             className="text-[26px] font-extrabold mb-6 text-[#1c1c1e] text-center leading-tight text-red-600"
                        />
                        <div className="w-16 h-1 bg-gray-200 rounded-full mb-8"></div>
                        <EditableText 
                            value={ctaDescription || ''}
                            onChange={(val) => onUpdateContent('ctaDescription', val)}
                            className="text-lg text-gray-700 leading-relaxed text-center max-w-[320px]"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="shrink-0 mb-3">
                            <EditableText 
                                value={title || ''}
                                onChange={(val) => onUpdateContent('title', val)}
                                className="text-[20px] font-extrabold text-[#1c1c1e] leading-[1.2] font-['Inter'] mb-2"
                            />
                             {intro_paragraph && (
                                 <EditableText 
                                    value={intro_paragraph}
                                    onChange={(val) => onUpdateContent('intro_paragraph', val)}
                                    className="text-[14px] text-gray-700 leading-normal"
                                />
                             )}
                        </div>
                        <div className="flex-grow flex flex-col justify-start gap-3 mb-3 overflow-y-auto no-scrollbar min-h-0">
                            {points?.map((point, i) => (
                                <div key={i} className="flex items-start text-[13px] text-[#1c1c1e] leading-snug">
                                    <span className="text-[#1c1c1e] mr-3 mt-1.5 w-1.5 h-1.5 bg-[#1c1c1e] rounded-full shrink-0"></span>
                                    <EditableText 
                                        value={point}
                                        onChange={(val) => {
                                            const newPoints = [...(points || [])];
                                            newPoints[i] = val;
                                            onUpdateContent('points', newPoints);
                                        }}
                                        className=""
                                    />
                                </div>
                            ))}
                        </div>
                        {blockquote_text && (
                             <div className="shrink-0 mt-auto border-l-[3px] border-[#C5C5C7] pl-4 py-2">
                                 <div className="text-[13px] text-gray-600 leading-snug font-medium">
                                    <EditableText 
                                        value={blockquote_text}
                                        onChange={(val) => onUpdateContent('blockquote_text', val)}
                                    />
                                 </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 2. NOTES DESIGN (Classic Apple Notes) ---
const NotesSlide: React.FC<Omit<CarouselSlideProps, 'design'>> = (props) => {
    const { isFirstPage, isCtaPage, title, intro_paragraph, points, blockquote_text, ctaTitle, ctaDescription, onUpdateContent, userProfile } = props;
    
    return (
        <div className="w-[375px] h-[469px] bg-[#FBFBF8] text-[#2D2D2D] font-sans overflow-hidden relative flex flex-col shadow-2xl">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`}}></div>
            
            <div className="flex items-center justify-between p-5 text-amber-500 relative z-10 shrink-0">
                <div className="flex items-center text-sm font-medium cursor-default">
                    <ArrowLeftIcon />
                    <span className="ml-1 truncate max-w-[150px]">Заметки</span>
                </div>
                 <div className="flex space-x-4">
                     <UploadIcon />
                     <MoreHorizontalIcon />
                 </div>
            </div>

            <div className="px-8 pt-2 pb-8 flex-1 flex flex-col relative z-10 font-['Inter'] overflow-hidden">
                {isFirstPage ? (
                    <div className="flex flex-col h-full justify-start pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Сегодня, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <EditableText 
                            value={title || ''} 
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-2xl font-bold leading-tight text-[#2D2D2D] tracking-tight mb-6 font-['Montserrat']"
                        />
                        <div className="w-12 h-1 bg-amber-500/30 rounded-full mb-6"></div>
                         <p className="text-xs text-gray-400">@{userProfile.handle.replace('@', '')}</p>
                    </div>
                ) : isCtaPage ? (
                     <div className="flex flex-col h-full justify-center items-center text-center">
                        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-5 text-2xl">✍️</div>
                        <EditableText 
                             value={ctaTitle || ''}
                             onChange={(val) => onUpdateContent('ctaTitle', val)}
                             className="text-2xl font-bold mb-3 text-[#2D2D2D] text-center font-['Montserrat']"
                        />
                        <EditableText 
                            value={ctaDescription || ''}
                            onChange={(val) => onUpdateContent('ctaDescription', val)}
                            className="text-sm text-gray-500 leading-relaxed text-center max-w-[260px]"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <EditableText 
                            value={title || ''}
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-lg font-bold text-[#2D2D2D] mb-4 leading-tight font-['Montserrat'] shrink-0"
                        />
                         {intro_paragraph && (
                             <EditableText 
                                value={intro_paragraph}
                                onChange={(val) => onUpdateContent('intro_paragraph', val)}
                                className="text-sm text-gray-600 leading-normal mb-5 shrink-0"
                            />
                         )}
                         <div className="flex-grow flex flex-col gap-3 overflow-y-auto no-scrollbar">
                            {points?.map((point, i) => (
                                <div key={i} className="flex items-start text-sm text-[#2D2D2D]">
                                    <span className="text-amber-500 mr-2.5 mt-1 shrink-0">•</span>
                                    <EditableText 
                                        value={point}
                                        onChange={(val) => {
                                            const newPoints = [...(points || [])];
                                            newPoints[i] = val;
                                            onUpdateContent('points', newPoints);
                                        }}
                                        className=""
                                    />
                                </div>
                            ))}
                        </div>
                         {blockquote_text && (
                             <div className="shrink-0 mt-auto pt-4">
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <EditableText 
                                        value={blockquote_text}
                                        onChange={(val) => onUpdateContent('blockquote_text', val)}
                                        className="text-xs text-gray-600 italic text-center"
                                    />
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. NOTES DARK DESIGN ---
const NotesDarkSlide: React.FC<Omit<CarouselSlideProps, 'design'>> = (props) => {
    const { isFirstPage, isCtaPage, title, intro_paragraph, points, blockquote_text, ctaTitle, ctaDescription, onUpdateContent, userProfile } = props;
    
    return (
        <div className="w-[375px] h-[469px] bg-[#1c1c1e] text-white font-sans overflow-hidden relative flex flex-col shadow-2xl">
             {/* Background Image with Dark Overlay */}
             {userProfile.avatarUrl && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={userProfile.avatarUrl} 
                        alt="Background" 
                        className="w-full h-full object-cover" 
                    />
                     {/* Conditional overlay for visibility */}
                     {isFirstPage ? (
                        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/30 to-black"></div>
                     ) : (
                        <div className="absolute inset-0 bg-[#1c1c1e]/95"></div>
                     )}
                </div>
            )}
            
            <div className="flex items-center justify-between p-5 text-amber-500 relative z-10 shrink-0">
                <div className="flex items-center text-sm font-medium cursor-default drop-shadow-sm">
                    <ArrowLeftIcon />
                    <span className="ml-1 truncate max-w-[150px]">Заметки</span>
                </div>
                 <div className="flex space-x-4 drop-shadow-sm">
                     <UploadIcon />
                     <MoreHorizontalIcon />
                 </div>
            </div>

            <div className="px-8 pt-2 pb-8 flex-1 flex flex-col relative z-10 font-['Inter'] overflow-hidden">
                {isFirstPage ? (
                    <div className="flex flex-col h-full justify-end pb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 drop-shadow-md">Сегодня, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <EditableText 
                            value={title || ''} 
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-2xl font-bold leading-tight text-white tracking-tight mb-6 font-['Montserrat'] drop-shadow-lg"
                        />
                        <div className="w-12 h-1 bg-amber-500/80 rounded-full mb-6 shadow-lg"></div>
                         <p className="text-xs text-gray-300 drop-shadow-md font-semibold">@{userProfile.handle.replace('@', '')}</p>
                    </div>
                ) : isCtaPage ? (
                     <div className="flex flex-col h-full justify-center items-center text-center">
                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-5 text-2xl">✍️</div>
                        <EditableText 
                             value={ctaTitle || ''}
                             onChange={(val) => onUpdateContent('ctaTitle', val)}
                             className="text-2xl font-bold mb-3 text-white text-center font-['Montserrat']"
                        />
                        <EditableText 
                            value={ctaDescription || ''}
                            onChange={(val) => onUpdateContent('ctaDescription', val)}
                            className="text-sm text-gray-400 leading-relaxed text-center max-w-[260px]"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <EditableText 
                            value={title || ''}
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-lg font-bold text-white mb-4 leading-tight font-['Montserrat'] shrink-0"
                        />
                         {intro_paragraph && (
                             <EditableText 
                                value={intro_paragraph}
                                onChange={(val) => onUpdateContent('intro_paragraph', val)}
                                className="text-sm text-gray-300 leading-normal mb-5 shrink-0"
                            />
                         )}
                         <div className="flex-grow flex flex-col gap-3 overflow-y-auto no-scrollbar">
                            {points?.map((point, i) => (
                                <div key={i} className="flex items-start text-sm text-gray-200">
                                    <span className="text-amber-500 mr-2.5 mt-1 shrink-0">•</span>
                                    <EditableText 
                                        value={point}
                                        onChange={(val) => {
                                            const newPoints = [...(points || [])];
                                            newPoints[i] = val;
                                            onUpdateContent('points', newPoints);
                                        }}
                                        className=""
                                    />
                                </div>
                            ))}
                        </div>
                         {blockquote_text && (
                             <div className="shrink-0 mt-auto pt-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <EditableText 
                                        value={blockquote_text}
                                        onChange={(val) => onUpdateContent('blockquote_text', val)}
                                        className="text-xs text-gray-400 italic text-center"
                                    />
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 4. INFLUENCER DESIGN (Personal Brand Style) ---
// Updated to match "Notes Dark" metrics (font sizes and spacing)
const InfluencerSlide: React.FC<Omit<CarouselSlideProps, 'design'>> = (props) => {
    const { isFirstPage, isCtaPage, title, intro_paragraph, points, blockquote_text, ctaTitle, ctaDescription, slideIndex, totalSlides, onUpdateContent, userProfile } = props;
    
    return (
        <div className="w-[375px] h-[469px] bg-[#111] text-white font-sans overflow-hidden relative flex flex-col shadow-2xl select-none">
            {/* Background Image */}
            {userProfile.avatarUrl && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={userProfile.avatarUrl} 
                        alt="Background" 
                        className="w-full h-full object-cover" 
                    />
                     {/* Gradient Overlay for readability */}
                     {isFirstPage ? (
                         <>
                             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/95"></div>
                             <div className="absolute inset-0 bg-black/10"></div>
                         </>
                     ) : (
                         <div className="absolute inset-0 bg-black/90"></div>
                     )}
                </div>
            )}

            {/* Header Area - Match Notes padding */}
            {!isFirstPage && (
                <div className="relative z-10 px-8 pt-5 mb-0 shrink-0 text-right">
                     <div className="inline-block">
                        <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                            {slideIndex + 1}/{totalSlides}
                        </p>
                     </div>
                </div>
            )}

            {/* Main Content - Match Notes Dark px-8 pt-2 pb-8 */}
            <div className="px-8 pt-2 pb-8 flex-1 flex flex-col relative z-10 font-['Inter'] overflow-hidden">
                {isFirstPage ? (
                    <div className="flex flex-col justify-end h-full pb-6">
                         {/* text-2xl matched to Notes Dark */}
                        <EditableText 
                            value={title || ''} 
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-2xl font-bold leading-[1.1] text-white tracking-tight text-left drop-shadow-2xl font-['Montserrat']"
                            placeholder="Заголовок..."
                        />
                    </div>
                ) : isCtaPage ? (
                     <div className="flex flex-col h-full justify-center items-center text-center">
                         {/* text-2xl matched to Notes Dark */}
                         <EditableText 
                             value={ctaTitle || ''}
                             onChange={(val) => onUpdateContent('ctaTitle', val)}
                             className="text-2xl font-bold text-white uppercase leading-none mb-3 font-['Montserrat']"
                        />
                        <div className="p-4 border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl">
                            {/* text-sm matched to Notes Dark */}
                            <EditableText 
                                value={ctaDescription || ''}
                                onChange={(val) => onUpdateContent('ctaDescription', val)}
                                className="text-sm text-white font-medium leading-relaxed max-w-[260px]"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full min-h-0">
                        {/* text-lg matched to Notes Dark */}
                        <EditableText 
                            value={title || ''}
                            onChange={(val) => onUpdateContent('title', val)}
                            className="text-lg font-bold text-white mb-4 leading-tight font-['Montserrat'] shrink-0"
                        />
                        
                        <div className="flex-grow flex flex-col gap-3 overflow-y-auto no-scrollbar min-h-0">
                             {intro_paragraph && (
                                /* text-sm matched to Notes Dark */
                                <EditableText 
                                    value={intro_paragraph}
                                    onChange={(val) => onUpdateContent('intro_paragraph', val)}
                                    className="text-sm text-gray-200 leading-relaxed shrink-0"
                                />
                            )}
                            
                            {points?.map((point, i) => (
                                /* text-sm matched to Notes Dark */
                                <div key={i} className="flex items-start text-sm text-gray-200 leading-relaxed">
                                    <EditableText 
                                        value={point}
                                        onChange={(val) => {
                                            const newPoints = [...(points || [])];
                                            newPoints[i] = val;
                                            onUpdateContent('points', newPoints);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                         {/* Footer/Blockquote */}
                         {blockquote_text && (
                             <div className="shrink-0 mt-auto pt-4">
                                <div className="p-3 bg-white/10 rounded-sm border-l-4 border-white">
                                    {/* text-xs matched to Notes Dark */}
                                    <EditableText 
                                        value={blockquote_text}
                                        onChange={(val) => onUpdateContent('blockquote_text', val)}
                                        className="text-xs text-white font-semibold leading-snug font-['Montserrat']"
                                    />
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Only show on first page or CTA page */}
            {(isFirstPage || isCtaPage) && (
                <div className="relative z-20 mt-auto shrink-0">
                    <div className="h-px bg-white/20 mb-2 mx-8 w-[calc(100%-64px)]"></div>
                    <div className="flex items-center justify-between px-8 pb-4 text-white">
                        <div className="flex items-center gap-2">
                             <ShareIcon />
                             <span className="text-xs font-medium">Поделиться</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-medium">Сохранить</span>
                             <SaveIcon />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const CarouselSlide: React.FC<CarouselSlideProps> = (props) => {
    const { design } = props;
    
    switch (design) {
        case 'journal':
            return <JournalSlide {...props} />;
        case 'notes':
            return <NotesSlide {...props} />;
        case 'notes-dark':
            return <NotesDarkSlide {...props} />;
        case 'influencer':
            return <InfluencerSlide {...props} />;
        default:
            return <NotesSlide {...props} />;
    }
};
