import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@jfrader/ui';
import { DeckProvider } from '@jfrader/ui/deck';
import { Toast } from '@jfrader/ui/toast';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@jfrader/tokens/tokens.css';
import '@jfrader/tokens/base.css';
import { App } from './app/app';
import { config } from './config';
import { copy } from './content/en';

document.title = config.appName;

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element.');

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <DeckProvider default="french" backLabel={copy.a11y.cardBack}>
        <Toast.Provider viewport="default">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Toast.Provider>
      </DeckProvider>
    </ThemeProvider>
  </StrictMode>,
);
