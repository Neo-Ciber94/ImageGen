import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="dark">
        <script dangerouslySetInnerHTML={{__html: `
            const dark = localStorage.getItem('theme') === 'dark';
            console.log({ dark });
            if (dark) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        `}}></script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
