import { RoleProvider } from '@/context/RoleContext';
import { MainShell } from '@/components/shell/MainShell';

export default function App() {
  return (
    <RoleProvider>
      <MainShell />
    </RoleProvider>
  );
}
