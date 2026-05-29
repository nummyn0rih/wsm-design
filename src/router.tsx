import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { StubPage } from '@/components/shell/StubPage';
import { ShipmentsPage } from '@/components/shipments/ShipmentsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/shipments" replace /> },
      { path: 'shipments', element: <ShipmentsPage /> },
      { path: 'logistics', element: <StubPage title="Логистика материалов" phase={2} /> },
      { path: 'contracts', element: <StubPage title="Контракты" phase={2} /> },
      { path: 'analytics', element: <StubPage title="Аналитика" phase={2} /> },
      { path: 'notifications', element: <StubPage title="Уведомления" phase={3} /> },
      { path: 'references/raws', element: <StubPage title="Сырьё" phase={2} /> },
      { path: 'references/suppliers', element: <StubPage title="Поставщики" phase={2} /> },
      { path: 'references/tks', element: <StubPage title="ТК" phase={2} /> },
      { path: 'references/drivers', element: <StubPage title="Водители (M10)" phase={2} /> },
      { path: 'references/tara-types', element: <StubPage title="Виды тары" phase={2} /> },
      { path: 'references/ingredients', element: <StubPage title="Ингредиенты" phase={2} /> },
      { path: 'references/seasons', element: <StubPage title="Сезоны" phase={2} /> },
      { path: 'settings', element: <StubPage title="Настройки" phase={3} /> },
      { path: '*', element: <StubPage /> },
    ],
  },
]);
