import { Link, useLocation } from 'react-router-dom';

// SVG компоненты иконок
const WishlistIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
      fill={active ? '#ffffff' : 'none'} 
      stroke="#ffffff" 
      strokeWidth="1.5"
    />
  </svg>
);

const IdeasIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C10.34 2 9 3.34 9 5C9 6.54 10.17 7.78 11.65 7.96V9H9C7.9 9 7 9.9 7 11V14C7 15.1 7.9 16 9 16V18C9 19.1 9.9 20 11 20H13C14.1 20 15 19.1 15 18V16C16.1 16 17 15.1 17 14V11C17 9.9 16.1 9 15 9H12.35V7.96C13.83 7.78 15 6.54 15 5C15 3.34 13.66 2 12 2Z" 
      fill={active ? '#ffffff' : 'none'}
      stroke="#ffffff"
      strokeWidth="1.5"
    />
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" 
      fill={active ? '#ffffff' : 'none'}
      stroke="#ffffff"
      strokeWidth="1.5"
    />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
      fill={active ? '#ffffff' : 'none'}
      stroke="#ffffff"
      strokeWidth="1.5"
    />
  </svg>
);

const tabs = [
  { name: 'Вишлист', path: '/', Icon: WishlistIcon },
  { name: 'Профиль', path: '/profile', Icon: ProfileIcon },
];

export default function TabBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center flex-1 h-full text-white"
            >
              <div className={`mb-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                <tab.Icon active={isActive} />
              </div>
              <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-500'}`}>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
