import { copyFileSync } from 'node:fs';

// Static hosts that understand a root 404.html serve the SPA shell for /rules
// and any other client-side route instead of a host-level 404.
copyFileSync('dist/index.html', 'dist/404.html');
