import { useEffect, useState } from 'preact/hooks';

export const themes = {
    light: 'light',
    dark: 'synthwave',
};

export function useTheme() {
    const systemTheme: keyof typeof themes = window.matchMedia(
        '(prefers-color-scheme: dark)'
    )
        ? 'dark'
        : 'light';
    const defaultTheme =
        (localStorage.getItem('theme') as keyof typeof themes) || systemTheme;

    const [theme, setTheme] = useState(defaultTheme);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document
            .querySelector('body')
            ?.setAttribute('data-theme', themes[theme]);
    }, [theme]);

    function toggleTheme() {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    return { theme, toggleTheme };
}
