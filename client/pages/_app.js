import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SessionProvider } from '../context/SessionContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    </AuthProvider>
  );
}