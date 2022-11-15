import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { NextIntlProvider } from 'next-intl';
import { Session } from "next-auth";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import '../styles/globals.css'
import fi from "../locales/fi.json";
import en from "../locales/en.json";
import se from "../locales/se.json";

const messages = { fi, en, se };

const App = ({ Component, pageProps }: AppProps<{ session: Session }>) => {
  const { locale } = useRouter();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SessionProvider session={pageProps.session}>
        <NextIntlProvider locale={locale} messages={messages[locale]}>
          <Component {...pageProps} />
        </NextIntlProvider>
      </SessionProvider>
    </LocalizationProvider>
  );
};

export default App;
