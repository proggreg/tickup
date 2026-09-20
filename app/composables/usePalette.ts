export const usePalette = () => {
    const palette = useState('pallette', () => [
        '#506076',
        '#005ac2',
        '#d23f7f',
        '#e8a92b',
        '#1a7a4a',
        '#ba1b24',
        '#7a3fb2',
        '#0096a5',
        '#b35b00',
        '#3c5b8a',
        '#5f7d4f',
        '#88607a',
    ]);
    return readonly(palette);
};
