import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeVideo } from '../services/geminiService';
import { VideoAnalysis } from '../types';
import Loader from './common/Loader';
import Card from './common/Card';

const extractYouTubeID = (url: string): string | null => {
  // This regex handles:
  // - standard watch URLs (https://www.youtube.com/watch?v=...)
  // - short URLs (https://youtu.be/...)
  // - embed URLs (https://www.youtube.com/embed/...)
  // - shorts URLs (https://www.youtube.com/shorts/...)
  // - live URLs (https://www.youtube.com/live/...)
  // - URLs with extra parameters
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};


const extractTitleFromReport = (report: string): string => {
  const lines = report.split('\n');
  const h1 = lines.find(line => line.trim().startsWith('# '));
  if (h1) {
    return h1.substring(h1.indexOf('# ') + 2).trim();
  }
  return lines.find(line => line.trim() !== '') || 'Untitled Analysis';
};


const VideoAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<VideoAnalysis | null>(null);
  const [history, setHistory] = useState<VideoAnalysis[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<VideoAnalysis | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('videoAnalysisHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoUrl.trim()) {
      setError('Please provide a valid YouTube video URL.');
      return;
    }

    const videoID = extractYouTubeID(videoUrl);
    if (!videoID) {
      setError('Invalid YouTube URL format. Please use a valid link (e.g., from the share button or browser address bar).');
      return;
    }
    
    const canonicalUrl = `https://www.youtube.com/watch?v=${videoID}`;

    setIsLoading(true);
    setError(null);
    setCurrentAnalysis(null);
    setSelectedHistoryItem(null);

    try {
      const report = await analyzeVideo(canonicalUrl);
      
      if (!report || report.trim() === '') {
        throw new Error("The model returned an empty analysis. This can happen if the video is private, age-restricted, or its content could not be processed.");
      }

      const title = extractTitleFromReport(report);

      const newAnalysis: VideoAnalysis = {
        id: new Date().toISOString(),
        videoUrl: canonicalUrl,
        title,
        timestamp: new Date().toLocaleString(),
        report,
      };
      setCurrentAnalysis(newAnalysis);
      const updatedHistory = [newAnalysis, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('videoAnalysisHistory', JSON.stringify(updatedHistory));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl, history]);

  const analysisToShow = selectedHistoryItem || currentAnalysis;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4 text-cyan-400">Analyze New Video</h2>
          <div className="space-y-4">
            <input
              type="url"
              placeholder="Enter YouTube video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
             <p className="text-xs text-gray-500 -mt-2">
              Note: Works best for videos with available transcripts/subtitles. May take longer for non-English videos.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !videoUrl.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Video'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </Card>
        <Card className="flex-grow">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">Analysis History</h2>
          <div className="overflow-y-auto max-h-96 custom-scrollbar pr-2">
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map(item => (
                  <li key={item.id}>
                    <button onClick={() => {setSelectedHistoryItem(item); setCurrentAnalysis(null);}}
                      className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <p className="font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.timestamp}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-400">No history yet.</p>}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 shrink-0">Analysis Result</h2>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
            {isLoading && <Loader message="Analyzing video, this may take a few moments..." />}
            {analysisToShow && (
              <div>
                <p className="text-xs text-gray-500 mb-4">Analyzed on: {analysisToShow.timestamp}</p>
                <div className="prose-custom">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisToShow.report}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            {!isLoading && !analysisToShow && 
              <div className="flex items-center justify-center h-full min-h-[100px]">
                <p className="text-gray-400 text-center">Enter a YouTube URL and click 'Analyze' to see the results here, or select an item from history.</p>
              </div>
            }
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VideoAnalyzer;