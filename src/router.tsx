import { createBrowserRouter } from 'react-router-dom';
import App from './App';

function Placeholder() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontFamily: "'Caveat', system-ui, sans-serif", fontSize: '32px' }}>
        WSM skeleton — M1
      </h1>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
        Project setup complete. Domain logic ships in M2+.
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Placeholder /> },
      { path: '*', element: <Placeholder /> },
    ],
  },
]);
