import { useState, useEffect, useRef } from 'react';
import { Box, Tab, Tabs, Typography, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const ShinyAppDisplay = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [scale, setScale] = useState(0.8);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
        setIsLoading(true);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const adjustScale = (delta: number) => {
        setScale(prev => Math.min(Math.max(0.5, prev + delta), 1));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                if (e.key === '=') {
                    e.preventDefault();
                    adjustScale(0.1);
                } else if (e.key === '-') {
                    e.preventDefault();
                    adjustScale(-0.1);
                }
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const appUrls = [
        '/shinyapp-frequentist/',  // Frequentist
        '/shinyapp-bayesian/'   // Bayesian
    ];

    const appTitles = [
        "Frequentist Meta Analysis",
        "Bayesian Meta Analysis"
    ];

    return (
        <Box sx={{ 
            width: '100%', 
            height: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5">
                        Shiny Apps Dashboard
                    </Typography>
                    <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                        <IconButton onClick={toggleFullscreen} size="large">
                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Alert severity="info" sx={{ mb: 1, py: 0 }}>
                    Please ensure you are connected to the VPN. Use Ctrl + and Ctrl - to zoom.
                </Alert>
                <Tabs 
                    value={selectedTab} 
                    onChange={handleChange} 
                    aria-label="Shiny Apps Tabs"
                    sx={{ minHeight: 36 }}
                >
                    {appTitles.map((title, index) => (
                        <Tab 
                            label={title} 
                            key={index} 
                            sx={{ 
                                minHeight: 36,
                                py: 0
                            }}
                        />
                    ))}
                </Tabs>
            </Box>
            {selectedTab !== -1 && (
                <Box 
                    ref={containerRef}
                    sx={{ 
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        mx: 3,
                        border: 1,
                        borderColor: 'divider',
                        ...(isFullscreen && {
                            mx: 0,
                            border: 'none',
                            height: '100vh',
                            width: '100vw',
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            zIndex: 1300
                        })
                    }}
                >
                    {isLoading && (
                        <CircularProgress
                            size={50}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1
                            }}
                        />
                    )}
                    <Box sx={{
                        width: `${100 / scale}%`,
                        height: `${100 / scale}%`,
                        transform: `scale(${scale})`,
                        transformOrigin: '0 0',
                    }}>
                        <iframe
                            src={appUrls[selectedTab]}
                            title={`${appTitles[selectedTab]} App`}
                            style={{ 
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                display: isLoading ? 'none' : 'block'
                            }}
                            onLoad={handleLoad}
                            allowFullScreen
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ShinyAppDisplay;