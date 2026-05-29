import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { seedIfEmpty } from './data/seed';
import { LocalStorageDriverRepo } from './repos/DriverRepo';
import { LocalStoragePlanRepo } from './repos/PlanRepo';
import { LocalStorageRawRepo } from './repos/RawRepo';
import { LocalStorageShipmentRepo } from './repos/ShipmentRepo';
import { LocalStorageSupplierRepo } from './repos/SupplierRepo';
import { LocalStorageTaraTypeRepo } from './repos/TaraTypeRepo';
import { LocalStorageTKRepo } from './repos/TKRepo';
import { type ConcreteRepos, RepoProvider } from './repos/RepoContext';
import './styles/global.css';

async function boot(): Promise<void> {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root not found');

  const repos: ConcreteRepos = {
    taraTypes: new LocalStorageTaraTypeRepo(),
    raws: new LocalStorageRawRepo(),
    tks: new LocalStorageTKRepo(),
    suppliers: new LocalStorageSupplierRepo(),
    drivers: new LocalStorageDriverRepo(),
    shipments: new LocalStorageShipmentRepo(),
    plans: new LocalStoragePlanRepo(),
  };
  await seedIfEmpty(repos);

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <RepoProvider value={repos}>
        <RouterProvider router={router} />
      </RepoProvider>
    </React.StrictMode>,
  );
}

void boot();
