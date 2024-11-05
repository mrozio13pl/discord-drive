import { h, render } from 'preact';
import { App } from './app';
import '@unocss/reset/tailwind.css';
import '@fontsource-variable/nunito-sans';
import './globals.css';
import 'uno.css';

render(<App />, document.getElementById('root')!);
