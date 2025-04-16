import React, { useState, useEffect } from 'react';

export default function ImageUpload() {
    const [image, setImage] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [correctedText, setCorrectedText] = useState('');
    const [displayedText, setDisplayedText] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [showCorrected, setShowCorrected] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
        setError('');
        setTranscribedText('');
        setCorrectedText('');
        setDisplayedText('');
        setShowResult(false);
        setShowCorrected(false);
    };

    const handleTranscribe = async () => {
        if (!image) {
            setError('Please upload an image first');
            return;
        }

        setIsTranscribing(true);
        setError('');

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            // Validate response
            if (!data || typeof data !== 'object') {
                setError('Invalid response from server');
                setTranscribedText('');
                setCorrectedText('');
                return;
            }

            console.log('Backend response:', data); // Debug log

            // Sanitize transcribed text
            const transcribed = typeof data.transcribedText === 'string'
                ? data.transcribedText.trim().replace(/\s+/g, ' ')
                : 'No readable text found in the image';
            setTranscribedText(transcribed);

            // Sanitize corrected text
            const corrected = typeof data.correctedText === 'string'
                ? data.correctedText.trim().replace(/\s+/g, ' ')
                : '';
            setCorrectedText(corrected);

            setShowResult(true);
        } catch (err) {
            console.error('Transcription error:', err);
            setError('Failed to connect to the server. Please try again.');
            setTranscribedText('');
            setCorrectedText('');
        } finally {
            setIsTranscribing(false);
        }
    };

    const handlePostProcess = () => {
        setShowCorrected(true);
    };

    // Animation effect for displaying transcribed text in chunks
    useEffect(() => {
        if (showResult && transcribedText && !showCorrected) {
            setDisplayedText(''); // Reset displayed text
            const words = transcribedText.split(' ').filter(word => word && word.trim()); // Remove empty/invalid words
            console.log('Words for animation:', words); // Debug log
            let currentIndex = 0;

            const interval = setInterval(() => {
                if (currentIndex < words.length) {
                    const nextWord = words[currentIndex] || ''; // Fallback to empty string
                    setDisplayedText((prev) => prev + (prev ? ' ' : '') + nextWord);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 200); // Speed of chunk animation (200ms per word)

            return () => clearInterval(interval);
        }
    }, [showResult, transcribedText, showCorrected]);

    // Update displayed text when showing corrected text
    useEffect(() => {
        if (showCorrected) {
            setDisplayedText(correctedText || 'No corrected text available');
        }
    }, [showCorrected, correctedText]);

    // Styles
    const canvasStyle = {
        width: '1920px',
        height: '1080px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'lavender',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
    };

    const borderStyle = {
        width: '1260px',
        height: '892px',
        border: '2px solid #967BB6',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '25px',
        backgroundColor: '#f8f0ff',
    };

    const imageAreaStyle = {
        width: '595px',
        height: '842px',
        border: '2px dashed #967BB6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: 'white',
    };

    const buttonStyle = {
        backgroundColor: '#7B4F9D',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        fontWeight: 600,
        transition: 'transform 0.2s, box-shadow 0.2s',
    };

    const transcribingStyle = {
        fontSize: '48px',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 600,
        color: '#967BB6',
        animation: 'fadeInOut 1.5s ease-in-out infinite',
        letterSpacing: '0.5px',
    };

    const hiddenInputStyle = {
        display: 'none',
    };

    const resultContainerStyle = {
        width: '1210px',
        height: '842px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
    };

    const resultBorderStyleLeft = {
        width: '595px',
        height: '842px',
        border: '2px solid #967BB6',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: 'white',
    };

    const resultBorderStyleRight = {
        width: '595px',
        height: '842px',
        border: '2px solid #967BB6',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align text to top
        padding: '30px', // Increased padding
        backgroundColor: 'white',
    };

    const imageResultStyle = {
        width: '595px',
        height: '842px',
        objectFit: 'contain',
        borderRadius: '10px',
    };

    const textResultStyle = {
        fontSize: '22px', // For more text
        color: '#4a4a4a',
        textAlign: 'left',
        maxHeight: '782px', // Adjusted for padding
        overflowY: 'auto',
        padding: '20px', // Inner padding
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        lineHeight: '1.5', // Readability
    };

    const errorStyle = {
        color: 'red',
        fontSize: '20px',
        marginTop: '10px',
    };

    return (
        <div style={canvasStyle}>
            {isTranscribing ? (
                <span style={transcribingStyle}>Transcribing...</span>
            ) : showResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={borderStyle}>
                        <div style={resultContainerStyle}>
                            <div style={resultBorderStyleLeft}>
                                {image && (
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Uploaded"
                                        style={imageResultStyle}
                                    />
                                )}
                            </div>
                            <div style={resultBorderStyleRight}>
                                <p style={textResultStyle}>
                                    {displayedText || 'No text available'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {!showCorrected && correctedText && (
                            <button
                                style={buttonStyle}
                                onClick={handlePostProcess}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                Post Process Text
                            </button>
                        )}
                        <button
                            style={buttonStyle}
                            onClick={() => {
                                setImage(null);
                                setTranscribedText('');
                                setCorrectedText('');
                                setDisplayedText('');
                                setShowResult(false);
                                setShowCorrected(false);
                                setError('');
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Upload Another Image
                        </button>
                    </div>
                </div>
            ) : (
                <div style={borderStyle}>
                    <label style={imageAreaStyle}>
                        {image ? (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Uploaded"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                            />
                        ) : (
                            <span style={{ color: '#4a4a4a', fontSize: '24px' }}>Click to upload image</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={hiddenInputStyle}
                        />
                    </label>
                    <button
                        style={buttonStyle}
                        onClick={handleTranscribe}
                        disabled={!image}
                        onMouseEnter={(e) => {
                            if (image) {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Transcribe
                    </button>
                    {error && <span style={errorStyle}>{error}</span>}
                </div>
            )}
            <style>
                {`
                    @keyframes fadeInOut {
                        0% { opacity: 0.2; }
                        50% { opacity: 1; }
                        100% { opacity: 0.2; }
                    }
                `}
            </style>
        </div>
    );
}