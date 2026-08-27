import { AuthProvider } from './authContext';
import AppRoutes from './Routes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
