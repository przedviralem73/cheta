import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-tg-bg">
      <main className="flex-1 pb-16 overflow-auto">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
