import { Project } from '../types';

export function buildWebSandboxDocument(project: Project): string {
  // Find index.html
  const htmlFile = project.files.find(f => f.path === 'index.html' || f.name.endsWith('.html'));
  let htmlContent = htmlFile ? htmlFile.content : '<!DOCTYPE html><html><head><title>Preview</title></head><body><div id="root"></div></body></html>';

  // Find CSS files
  const cssFiles = project.files.filter(f => f.language === 'css' || f.name.endsWith('.css'));
  const bundledCss = cssFiles.map(c => `/* ${c.path} */\n${c.content}`).join('\n\n');

  // Find JS/TS files
  const jsFiles = project.files.filter(f => 
    (f.language === 'javascript' || f.language === 'typescript') &&
    !f.name.includes('.test.') &&
    !f.name.includes('vite.config') &&
    !f.name.includes('next.config')
  );

  // Injected console logger script
  const consoleInterceptor = `
  <script>
    (function() {
      const origLog = console.log;
      const origError = console.error;
      const origWarn = console.warn;

      function sendToParent(type, args) {
        try {
          const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          window.parent.postMessage({ source: 'pocketforge-sandbox-log', type, text }, '*');
        } catch (e) {}
      }

      console.log = function(...args) { origLog.apply(console, args); sendToParent('log', args); };
      console.warn = function(...args) { origWarn.apply(console, args); sendToParent('warn', args); };
      console.error = function(...args) { origError.apply(console, args); sendToParent('error', args); };

      window.onerror = function(msg, url, line) {
        sendToParent('error', ['Uncaught Error: ' + msg + ' (Line ' + line + ')']);
        return false;
      };
    })();
  </script>
  `;

  // Inject CSS
  if (bundledCss.trim()) {
    const styleTag = `<style id="pocketforge-bundle-css">\n${bundledCss}\n</style>`;
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
    } else {
      htmlContent = `${styleTag}\n${htmlContent}`;
    }
  }

  // Inject console interceptor
  if (htmlContent.includes('<head>')) {
    htmlContent = htmlContent.replace('<head>', `<head>\n${consoleInterceptor}`);
  } else {
    htmlContent = `${consoleInterceptor}\n${htmlContent}`;
  }

  // Handle JavaScript: If app.js or main.js or App.jsx exists
  let bundledJs = '';
  for (const js of jsFiles) {
    // If it's pure JS or React component, bundle
    bundledJs += `\n/* File: ${js.path} */\ntry {\n${js.content}\n} catch(err) { console.error('Error in ${js.path}:', err.message); }\n`;
  }

  if (bundledJs.trim()) {
    const scriptTag = `<script>\n${bundledJs}\n</script>`;
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      htmlContent += `\n${scriptTag}`;
    }
  }

  return htmlContent;
}

export function createSandboxBlobUrl(project: Project): string {
  const doc = buildWebSandboxDocument(project);
  const blob = new Blob([doc], { type: 'text/html' });
  return URL.createObjectURL(blob);
}
