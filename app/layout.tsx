import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '@/components/ui/Toaster';
import { CookieBanner } from '@/components/ui/CookieBanner';
import { ExitIntentQuiz } from '@/components/quiz/ExitIntentQuiz';
import './globals.css';

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ТиЯКСа.Ремонт — Ремонт квартир в Санкт-Петербурге',
  description:
    'Ремонт квартир под ключ в Санкт-Петербурге. Фиксированная смета, видеоотчёты каждую неделю, управляющая компания. Гарантия 3 года.',
  keywords: 'ремонт квартир СПб, ремонт под ключ, ТиЯКСа, ремонт Санкт-Петербург',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=111307528','ym');
          ym(111307528,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
        `}</Script>
      </head>
      <body className="font-sans">
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/111307528" style={{position:'absolute',left:'-9999px'}} alt="" /></div>
        </noscript>
        {children}
        <Toaster />
        <CookieBanner />
        <ExitIntentQuiz />
      </body>
    </html>
  );
}
