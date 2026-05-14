import { useRef, useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const [selectedRef, setSelectedRef] =
    useState<ReferenceItem | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [generatedImageUrl, setGeneratedImageUrl] =
    useState<string>('');

  const [rawImageUrl, setRawImageUrl] =
    useState<string>('');

  const [imgLoadFailed, setImgLoadFailed] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState<boolean>(false);

  const [generationError, setGenerationError] =
    useState<string>('');

  const activeRequestId = useRef<string>('');

  // Primary photos
  const [photo1, setPhoto1] =
    useState<File | null>(null);

  const [photo2, setPhoto2] =
    useState<File | null>(null);

  const [preview1, setPreview1] =
    useState<string>('');

  const [preview2, setPreview2] =
    useState<string>('');

  // Secondary photos
  const [photo1b, setPhoto1b] =
    useState<File | null>(null);

  const [photo2b, setPhoto2b] =
    useState<File | null>(null);

  const [preview1b, setPreview1b] =
    useState<string>('');

  const [preview2b, setPreview2b] =
    useState<string>('');

  const handleImageSelect = (ref: ReferenceItem) => {
    setSelectedCategory(ref.style);
    setSelectedRef(ref);
    setCurrentView('upload');
  };

  const pollPrediction = (
    predictionId: string,
    requestId: string
  ) => {
    const POLL_INTERVAL_MS = 2500;

    const apiBase =
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

    const authHeader = {
      Authorization:
        `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    const poll = async () => {
      if (activeRequestId.current !== requestId) {
        return;
      }

      try {
        const res = await fetch(
          `${apiBase}?id=${predictionId}`,
          {
            headers: authHeader,
          }
        );

        if (activeRequestId.current !== requestId) {
          return;
        }

        const data = await res.json() as {
          provider?: string;
          status: string;
          output?: string;
          error?: string;
        };

        console.log('[POLL] id=' + predictionId + ' provider=' + data.provider + ' status=' + data.status);

        if (data.status === 'succeeded') {
          const rawUrl = data.output ?? '';
          console.log('[POLL] succeeded url:', rawUrl.substring(0, 100));
          setGenerationError('');
          setImgLoadFailed(false);
          setRawImageUrl(rawUrl);
          setGeneratedImageUrl(rawUrl);
          setIsGenerating(false);
          return;
        }

        if (data.status === 'failed' || data.status === 'canceled') {
          console.error('[POLL] prediction', data.status, data.error);
          setGenerationError(data.error || 'Generation failed. Please try again.');
          setIsGenerating(false);
          return;
        }

        // processing — keep polling
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (activeRequestId.current !== requestId) {
          return;
        }

        console.warn(
          '[POLL] network error, retrying:',
          err instanceof Error
            ? err.message
            : err
        );

        setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();
  };

  const handleGenerate = async (
    photo1: File,
    photo2: File,
    referenceFile: File,
    mode?: string,
    photo1b?: File | null,
    photo2b?: File | null,
  ) => {
    if (isGenerating) {
      return;
    }

    // cleanup old blob urls
    if (generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
    }

    if (
      !photo1 ||
      !photo2 ||
      !referenceFile ||
      !selectedRef
    ) {
      setGenerationError(
        'Missing required data. Please try again.'
      );

      return;
    }

    const requestId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

    activeRequestId.current = requestId;

    setIsGenerating(true);

    setGenerationError('');
    setGeneratedImageUrl('');
    setRawImageUrl('');

    setImgLoadFailed(false);

    setCurrentView('result');

    console.log(
      '[DEVICE]',
      navigator.userAgent
    );

    console.log(
      '[GENERATE] requestId=' +
        requestId +
        ' referenceId=' +
        selectedRef.id
    );

    const formData = new FormData();

    formData.append('person1', photo1);

    if (photo1b) {
      formData.append('person1b', photo1b);
    }

    formData.append('person2', photo2);

    if (photo2b) {
      formData.append('person2b', photo2b);
    }

    formData.append(
      'reference',
      referenceFile
    );

    formData.append(
      'style',
      selectedRef.style
    );

    formData.append(
      'referenceId',
      selectedRef.id
    );

    formData.append(
      'prompt',
      selectedRef.prompt ?? ''
    );

    if (mode) {
      formData.append('mode', mode);
    }

    const apiUrl =
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

    const MAX_START_RETRIES = 0;

    for (
      let attempt = 0;
      attempt <= MAX_START_RETRIES;
      attempt++
    ) {
      if (activeRequestId.current !== requestId) {
        return;
      }

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },

          body: formData,
        });

        // Validate content-type before parsing
        const ct = response.headers.get('content-type') ?? '';
        if (!ct.includes('application/json')) {
          throw new Error(
            `Unexpected response type "${ct}" — expected application/json`
          );
        }

        const jsonData = await response.json() as {
          provider?: 'openai' | 'replicate';
          status?: string;
          predictionId?: string;
          output?: string;
          error?: string;
          model?: string;
          referenceId?: string;
          functionVersion?: string;
        };

        console.log('[GENERATE RESPONSE]', {
          provider: jsonData.provider,
          status: jsonData.status,
          predictionId: jsonData.predictionId,
          output: jsonData.output?.substring(0, 80),
          functionVersion: jsonData.functionVersion,
        });

        if (activeRequestId.current !== requestId) {
          return;
        }

        if (!response.ok) {
          const message =
            typeof jsonData?.error === 'string'
              ? jsonData.error
              : JSON.stringify(jsonData);
          throw new Error(message || 'Failed to start generation');
        }

        // OpenAI: always immediate — never poll
        if (jsonData.provider === 'openai' && jsonData.status === 'succeeded' && jsonData.output) {
          console.log('[GENERATE] OpenAI immediate result, provider=openai');
          setGenerationError('');
          setImgLoadFailed(false);
          setRawImageUrl(jsonData.output);
          setGeneratedImageUrl(jsonData.output);
          setIsGenerating(false);
          return;
        }

        // Replicate: start polling using predictionId
        if (jsonData.provider === 'replicate' && jsonData.predictionId) {
          console.log('[GENERATE] Replicate prediction started id=' + jsonData.predictionId);
          pollPrediction(jsonData.predictionId, requestId);
          return;
        }

        throw new Error(
          `Unexpected response shape: provider=${jsonData.provider} status=${jsonData.status}`
        );

      } catch (err) {
        if (activeRequestId.current !== requestId) {
          return;
        }

        const msg =
          err instanceof Error
            ? err.message
            : String(err);

        const lower = msg.toLowerCase();

        const isNetworkTimeout =
          lower.includes(
            'failed to fetch'
          ) ||
          lower.includes('network') ||
          lower.includes('timeout') ||
          lower.includes('aborted');

        if (
          isNetworkTimeout &&
          attempt < MAX_START_RETRIES
        ) {
          console.warn(
            `[GENERATE] network timeout on attempt ${
              attempt + 1
            }, retrying in 3s...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, 3000)
          );

          continue;
        }

        console.error(
          '[GENERATE ERROR] requestId=' +
            requestId,
          msg
        );

        setGenerationError(
          msg ||
            'Generation failed. Please try again.'
        );

        setIsGenerating(false);

        return;
      }
    }
  };

  const handleBackToHome = () => {
    activeRequestId.current = '';

    if (generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
    }

    setCurrentView('home');

    setSelectedRef(null);
    setSelectedCategory(null);

    setGeneratedImageUrl('');
    setRawImageUrl('');

    setImgLoadFailed(false);
    setGenerationError('');

    setPhoto1(null);
    setPhoto2(null);

    setPreview1('');
    setPreview2('');

    setPhoto1b(null);
    setPhoto2b(null);

    setPreview1b('');
    setPreview2b('');
  };

  const handleBackFromUpload = () => {
    setCurrentView('home');

    setGeneratedImageUrl('');
    setRawImageUrl('');

    setImgLoadFailed(false);
    setGenerationError('');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');

    setGeneratedImageUrl('');
    setRawImageUrl('');

    setImgLoadFailed(false);
    setGenerationError('');
  };

  return (
    <>
      <AnimatedBackground />

      {currentView === 'home' && (
        <Home
          onImageSelect={handleImageSelect}
          initialCategory={
            selectedCategory
          }
        />
      )}

      {currentView === 'upload' &&
        selectedRef && (
          <Upload
            selectedRef={selectedRef}
            onBack={handleBackFromUpload}
            onGenerate={handleGenerate}
            photo1={photo1}
            setPhoto1={setPhoto1}
            photo2={photo2}
            setPhoto2={setPhoto2}
            preview1={preview1}
            setPreview1={setPreview1}
            preview2={preview2}
            setPreview2={setPreview2}
            photo1b={photo1b}
            setPhoto1b={setPhoto1b}
            photo2b={photo2b}
            setPhoto2b={setPhoto2b}
            preview1b={preview1b}
            setPreview1b={setPreview1b}
            preview2b={preview2b}
            setPreview2b={setPreview2b}
          />
        )}

      {currentView === 'result' && (
        <Result
          onBack={handleBackToUpload}
          onStartOver={handleBackToHome}
          generatedImageUrl={
            generatedImageUrl
          }
          rawImageUrl={rawImageUrl}
          imgLoadFailed={imgLoadFailed}
          onImgError={(src) => {
            console.log(
              '[IMG ERROR]',
              src
            );

            setImgLoadFailed(true);
          }}
          onImgLoad={() => {
            console.log(
              '[IMG LOADED]',
              generatedImageUrl?.substring(
                0,
                80
              )
            );
          }}
          isGenerating={isGenerating}
          generationError={generationError}
        />
      )}
    </>
  );
}

export default App;