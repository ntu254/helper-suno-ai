
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CREATIVE_CATEGORIES, CREATIVE_EXPLANATIONS } from './constants';
import { Section } from './components/Section';
import { IconButton } from './components/IconButton';
import { CopyableInfo } from './components/CopyableInfo';

const App: React.FC = () => {
    const initialSelections = Object.keys(CREATIVE_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: 'Ngẫu nhiên' }), {});
    
    const [selections, setSelections] = useState<{ [key: string]: string }>(initialSelections);
    const [songDescription, setSongDescription] = useState<string>('');
    const [isInstrumental, setIsInstrumental] = useState<boolean>(false);
    const [promptStructure, setPromptStructure] = useState<'Simple' | 'Detailed'>('Simple');
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [generatedPromptEn, setGeneratedPromptEn] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isDonateModalOpen, setDonateModalOpen] = useState(false);

    const handleSelectionChange = (category: string, value: string) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    const generatePrompt = async () => {
        const hasSelections = Object.values(selections).some(value => value !== 'Ngẫu nhiên');
        if (!hasSelections && !songDescription) {
            alert("Vui lòng chọn ít nhất một mục hoặc thêm mô tả bài hát.");
            return;
        }

        setIsGenerating(true);
        setGeneratedPrompt('');
        setGeneratedPromptEn('');

        const getSelection = (category: string) => {
            const value = selections[category];
            return value !== 'Ngẫu nhiên' ? value : null;
        };
        
        const theme = getSelection('Chủ đề');
        const melody = getSelection('Giai điệu');
        const harmony = getSelection('Hòa âm');
        const rhythm = getSelection('Nhịp điệu');
        const structure = getSelection('Cấu trúc');
        const instrumentation = getSelection('Nhạc cụ');
        const genre = getSelection('Thể loại');
        const mood = getSelection('Tâm trạng');
        const dynamics = getSelection('Động lực học');
        const production = getSelection('Sản xuất');
        const creativity = getSelection('Sáng tạo');
        const vocalStyle = getSelection('Giọng hát');

        let finalPrompt = '';

        if (promptStructure === 'Simple') {
            const priorityTags = [
                genre,
                mood,
                theme,
                isInstrumental ? null : vocalStyle,
                instrumentation,
                rhythm,
                production
            ].filter(Boolean);

            const otherTags = [melody, harmony, structure, dynamics, creativity].filter(Boolean);
            
            const allTags = [...new Set([...priorityTags, ...otherTags])];
            if (isInstrumental) {
                allTags.unshift('Không lời');
            }

            const tagsPart = allTags.join(', ');
            
            finalPrompt = songDescription 
                ? `${songDescription.trim()}\n\n${tagsPart}` 
                : tagsPart;

        } else { // Detailed
            const phrases: string[] = [];

            if (songDescription) {
                phrases.push(isInstrumental 
                    ? `Một bản nhạc không lời về ${songDescription.trim()}.`
                    : `Một bài hát về ${songDescription.trim()}.`
                );
                if (theme) phrases.push(`Tác phẩm khám phá chủ đề ${theme.toLowerCase()}.`);
            } else if (theme) {
                phrases.push(`Một tác phẩm khám phá chủ đề ${theme.toLowerCase()}.`);
            }

            let coreDescription = '';
            if (genre || mood) {
                const moodText = mood ? ` ${mood.toLowerCase()}` : '';
                const genreText = genre ? ` ${genre.toLowerCase()}` : '';
                const type = isInstrumental ? 'bản nhạc' : 'bài hát';
                coreDescription = `Một ${type}${genreText}${moodText}.`;
                if(phrases.length > 0) {
                    coreDescription = `Đó là một ${type}${genreText}${moodText}.`;
                }
            }
             if (coreDescription) phrases.push(coreDescription.trim());
            
            const featureParts = [];
            if (instrumentation) featureParts.push(`nhạc cụ ${instrumentation.toLowerCase()}`);
            if (!isInstrumental && vocalStyle) featureParts.push(`giọng hát ${vocalStyle.toLowerCase()}`);
            
            if (featureParts.length > 0) {
                phrases.push(`Nổi bật với ${featureParts.join(' và ')}.`);
            }
            
            const musicalChars = [];
            if (melody) musicalChars.push(`giai điệu ${melody.toLowerCase()}`);
            if (harmony) musicalChars.push(`hòa âm ${harmony.toLowerCase()}`);
            if (rhythm) musicalChars.push(`nhịp điệu ${rhythm.toLowerCase()}`);
            if (dynamics) musicalChars.push(`động lực học ${dynamics.toLowerCase()}`);

            if (musicalChars.length > 0) {
                phrases.push(`Âm nhạc được đặc trưng bởi ${musicalChars.join(', ')}.`);
            }

            const productionChars = [];
            if (production) productionChars.push(production.toLowerCase());
            if (creativity) productionChars.push(creativity.toLowerCase());
            
            if (productionChars.length > 0) {
                phrases.push(`Phong cách sản xuất là ${productionChars.join(' và ')}.`);
            }

            if (structure) {
                phrases.push(`Bài hát theo cấu trúc ${structure.toLowerCase()}.`);
            }

            finalPrompt = phrases.join(' ').replace(/\s+/g, ' ').trim();
        }

        setGeneratedPrompt(finalPrompt);

        if (finalPrompt) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const translationPrompt = `Translate the following Vietnamese text to English. This is a prompt for a music generation AI. Keep the structure, tags, and musical terms as accurate as possible.
---
Vietnamese Prompt:
${finalPrompt}
---
English Prompt:`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: translationPrompt,
                });
                setGeneratedPromptEn(response.text);
            } catch (error) {
                console.error("Error translating prompt:", error);
                setGeneratedPromptEn("Translation failed. Please try again.");
            } finally {
                setIsGenerating(false);
            }
        } else {
            setIsGenerating(false);
        }
    };

    const copyPrompt = (textToCopy: string) => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Đã sao chép prompt vào clipboard!');
        }).catch(err => {
            console.error('Lỗi sao chép: ', err);
            alert('Sao chép thất bại.');
        });
    };

    const downloadPrompt = (textToDownload: string, lang: 'vi' | 'en') => {
        if (!textToDownload) return;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suno_prompt_${lang}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const GuideSection = () => (
        <Section icon="fa-book-open" title="📚 Hướng dẫn tạo Prompt cho Suno">
            <div className="space-y-4 text-slate-300 text-sm">
                <p>Bằng cách mở rộng prompt vượt ra ngoài các thể loại và tâm trạng cơ bản, bạn có thể mở khóa những khả năng sáng tạo mới và tạo ra những bài hát thực sự độc đáo.</p>
                <details className="bg-slate-700/50 p-3 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-fuchsia-400">Kết hợp nhiều phong cách</summary>
                    <p className="mt-2">Thay vì "adventure rock", hãy thử: "Jazztronica, Groovy, Electric piano, Urban nightlife, Crisp and clean production, Jazz and electronica fusion.”</p>
                </details>
                <details className="bg-slate-700/50 p-3 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-fuchsia-400">Sử dụng các giai đoạn thời gian</summary>
                    <p className="mt-2">Lấy cảm hứng từ các thập kỷ: "1980s influence, Synthwave, Nostalgic, Synthesizers, 80s futurism, Analog warmth"</p>
                </details>
                <details className="bg-slate-700/50 p-3 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-fuchsia-400">Sử dụng ảnh hưởng văn hóa</summary>
                    <p className="mt-2">Thêm một hương vị độc đáo: "Ambient, Reflective, Sitar, Urban meditation, Lo-fi textures, Indian classical influence.”</p>
                </details>
                 <details className="bg-slate-700/50 p-3 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-fuchsia-400">Tập trung vào cảm xúc và câu chuyện</summary>
                    <p className="mt-2">Tạo ra một bài hát kể chuyện: "Melancholic, Storytelling, Acoustic guitar, Reflective vocals, A tale of lost love, Rainy day mood."</p>
                </details>
                 <details className="bg-slate-700/50 p-3 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-fuchsia-400">Tạo không khí điện ảnh</summary>
                    <p className="mt-2">Sáng tác một bản nhạc phim: "Epic, Orchestral, Soaring strings, Powerful brass section, Cinematic, A hero's journey, Victorious climax."</p>
                </details>
                 <details className="bg-slate-700/50 p-3 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-fuchsia-400">Tùy chỉnh prompt với lời bài hát</summary>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Cấu trúc bài hát: <code>[Bass drop]</code>, <code>[Breakdown]</code></li>
                        <li>Tùy chỉnh nhạc cụ: <code>[synthwave]</code>, <code>[noodling electric guitar solo]</code></li>
                        <li>Chỉ định phong cách vocal: <code>[Vocal Breakdown]</code>, <code>[female acapella]</code></li>
                    </ul>
                </details>
            </div>
        </Section>
    );
    
    const DonateModal = () => (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
            onClick={() => setDonateModalOpen(false)}
        >
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans">
            {isDonateModalOpen && <DonateModal />}
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8 relative">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">
                            Trình tạo Prompt cho Suno AI
                        </h1>
                    </div>
                    <p className="mt-2 text-slate-400 max-w-3xl mx-auto">
                       Tạo các prompt chuyên nghiệp, có cấu trúc cho việc tạo nhạc bằng Suno AI. Chọn phong cách, thêm mô tả, và tạo ra một prompt sẵn sàng sử dụng.
                    </p>

                </header>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 flex flex-col gap-8">
                        
                        {/* Creative Matrix */}
                        <Section icon="fa-border-all" title="🎨 Bảng sáng tạo">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                                {Object.entries(CREATIVE_CATEGORIES).map(([category, options]) => (
                                    <div key={category}>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">{category}</label>
                                        <select
                                            value={selections[category]}
                                            onChange={(e) => handleSelectionChange(category, e.target.value)}
                                            className="w-full bg-stone-200 border border-stone-300 text-slate-900 rounded-lg p-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition"
                                        >
                                            {options.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {selections[category] !== 'Ngẫu nhiên' && CREATIVE_EXPLANATIONS[category]?.[selections[category]] && (
                                            <p className="text-xs text-slate-400 mt-2 bg-slate-700/50 p-2 rounded">
                                                {CREATIVE_EXPLANATIONS[category][selections[category]]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* Song Description */}
                        <Section icon="fa-file-audio" title="📝 Mô tả bài hát (Tùy chọn)">
                            <textarea
                                value={songDescription}
                                onChange={(e) => setSongDescription(e.target.value)}
                                placeholder="VD: một bài hát u sầu về mối tình đã mất trong một ngày mưa..."
                                className="w-full h-24 bg-slate-700/50 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition resize-y"
                            />
                        </Section>

                        {/* Options & Structure */}
                        <Section icon="fa-sliders" title="⚙️ Tùy chọn & Cấu trúc">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={isInstrumental}
                                            onChange={e => setIsInstrumental(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="block bg-slate-700 w-14 h-8 rounded-full peer-checked:bg-fuchsia-600 transition"></div>
                                        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
                                    </div>
                                    <span>Không lời</span>
                                </label>

                                <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg p-1">
                                    <button
                                        onClick={() => setPromptStructure('Simple')}
                                        className={`px-4 py-1 rounded-md text-sm transition ${promptStructure === 'Simple' ? 'bg-fuchsia-600 text-white' : 'hover:bg-slate-600'}`}
                                    >
                                        Đơn giản
                                    </button>
                                    <button
                                        onClick={() => setPromptStructure('Detailed')}
                                        className={`px-4 py-1 rounded-md text-sm transition ${promptStructure === 'Detailed' ? 'bg-fuchsia-600 text-white' : 'hover:bg-slate-600'}`}
                                    >
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        </Section>

                        {/* Generate Button */}
                        <button
                            onClick={generatePrompt}
                            disabled={isGenerating}
                            className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-700 rounded-xl hover:from-fuchsia-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                    Tạo Prompt
                                </>
                            )}
                        </button>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Generated Prompt */}
                        <Section icon="fa-star" title="🌟 Prompt đã tạo">
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg text-slate-500">
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                    Đang tạo và dịch prompt...
                                </div>
                            ) : generatedPrompt ? (
                                <div className="space-y-6">
                                    {/* Vietnamese Prompt */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-300 mb-2">Tiếng Việt</h3>
                                        <pre className="whitespace-pre-wrap bg-slate-900/70 p-4 rounded-lg text-slate-300 font-mono text-sm max-h-60 overflow-y-auto">
                                            {generatedPrompt}
                                        </pre>
                                        <div className="flex gap-4 mt-4">
                                            <IconButton icon="fa-copy" text="Sao chép" onClick={() => copyPrompt(generatedPrompt)} />
                                            <IconButton icon="fa-download" text="Tải xuống" onClick={() => downloadPrompt(generatedPrompt, 'vi')} />
                                        </div>
                                    </div>

                                    {/* English Prompt */}
                                    {generatedPromptEn && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-300 mb-2">Tiếng Anh</h3>
                                            <pre className="whitespace-pre-wrap bg-slate-900/70 p-4 rounded-lg text-slate-300 font-mono text-sm max-h-60 overflow-y-auto">
                                                {generatedPromptEn}
                                            </pre>
                                            <div className="flex gap-4 mt-4">
                                                <IconButton icon="fa-copy" text="Sao chép" onClick={() => copyPrompt(generatedPromptEn)} />
                                                <IconButton icon="fa-download" text="Tải xuống" onClick={() => downloadPrompt(generatedPromptEn, 'en')} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg text-slate-500">
                                    Prompt của bạn sẽ xuất hiện ở đây...
                                </div>
                            )}
                        </Section>

                        {/* Guide */}
                        <GuideSection />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
