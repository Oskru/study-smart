import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './protected-route.tsx';
import Home from './home.tsx';
import SignUp from '../copied-material/sign-up/SignUp.tsx';
import Preferences from './preferences.tsx';
import Login from './login.tsx';
import Register from './register.tsx';
import { Students } from './students.tsx';
import { Planner } from './planner.tsx';
import { Admin } from './admin-panel.tsx';
import UserList from './user-list.tsx';
import AddPlanner from './add-planner.tsx';
import Availabilities from './availabilities.tsx';
import { About } from './about.tsx';
import LecturerPendingConfirmation from './lecturer-pending-confirmation.tsx';

// Public routes accessible to all users
const routesForPublic = [
  {
    path: '/service',
    element: <div>Service Page</div>,
  },
  {
    path: '/about-us',
    element: <div>About Us</div>,
  },
];

// Routes accessible only to NON-authenticated users (ALWAYS included)
const routesForNotAuthenticatedOnly = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/lecturer-confirmation',
    element: <LecturerPendingConfirmation />,
  },
];

// Routes accessible only to authenticated users
const routesForAuthenticatedOnly = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/register',
        element: <SignUp />,
      },
      {
        path: '/preferences',
        element: <Preferences />,
      },
      {
        path: '/availabilities',
        element: <Availabilities />,
      },
      {
        path: '/students',
        element: <Students />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/planner',
        element: <Planner />,
      },
      {
        path: '/admin-panel',
        element: <Admin />,
        children: [
          {
            path: 'users',
            element: <UserList />,
          },
          {
            path: 'add-planner',
            element: <AddPlanner />,
          },
        ],
      },
    ],
  },
];

// Combine routes
const router = createBrowserRouter([
  ...routesForPublic,
  ...routesForNotAuthenticatedOnly,
  ...routesForAuthenticatedOnly,
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
