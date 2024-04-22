import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

const Analysis = ({ location }) => {
    const [audioAnalysis, setAudioAnalysis] = useState(null);

    const searchParams = new URLSearchParams(location.search);
    const spotifyTrackId = searchParams.get('song.spotifySongId');
    console.log("songid",spotifyTrackId);

    useEffect(() => {
        const fetchAudioAnalysis = async () => {
            try {
                const response = await fetch(`https://api.spotify.com/v1/audio-analysis/${spotifyTrackId}`, {
                    headers: {
                        'Authorization': 'Bearer <your_access_token_here>'
                    }
                });
                const data = await response.json();
                setAudioAnalysis(data);
            } catch (error) {
                console.error('Error fetching audio analysis:', error);
            }
        };

        fetchAudioAnalysis();
    }, [spotifyTrackId]);

    if (!audioAnalysis) {
        return <div>Loading...</div>;
    }

    const { segments } = audioAnalysis;

    const data = {
        labels: segments.map((segment, index) => `Segment ${index + 1}`),
        datasets: [
            {
                label: 'Loudness',
                data: segments.map(segment => segment.loudness),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Tempo',
                data: segments.map(segment => segment.tempo),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
                label: 'Pitch',
                data: segments.map(segment => segment.pitches.reduce((max, value, index) => value > max ? index : max, 0)),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Song Audio Analysis',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Segment',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Value',
                },
            },
        },
    };

    return (
        <div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <Line data={data} options={options} />
        </div>
    );
};

export default Analysis;
