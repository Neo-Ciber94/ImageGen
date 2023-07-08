import { Html, Head, Main, NextScript } from "next/document";

const JS_SCRIPT = /* javascript */ `
  const systemIsDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = localStorage.getItem('theme');
  const dark = theme == null ? systemIsDarkMode : theme === 'dark';

  // Update the current theme scheme
  localStorage.setItem('theme', dark ? 'dark' : 'light');

  if (dark) {
      document.body.classList.add('dark');
  } else {
      document.body.classList.remove('dark');
  }
`;

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="dark">
        <script dangerouslySetInnerHTML={{ __html: JS_SCRIPT }}></script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
