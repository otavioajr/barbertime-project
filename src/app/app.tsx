import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './providers/app-provider';
import { router } from './router';

export function App(): JSX.Element {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
