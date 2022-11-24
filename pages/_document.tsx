import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}


if (process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', async () => {
    const res = await fetch(process.env.NEXTAUTH_URL || "https://smartq.miestentie.com");
    console.log(res.status);
    console.log('Exiting');
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    const res = await fetch(process.env.NEXTAUTH_URL || "https://smartq.miestentie.com");
    console.log(res.status);
    console.log('Exiting');
    process.exit(0);
  });
}
