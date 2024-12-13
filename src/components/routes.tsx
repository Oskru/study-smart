import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './protected-route.tsx';
import Home from './home.tsx';
import SignUp from '../copied-material/sign-up/SignUp.tsx';
import Preferences from './preferences.tsx';
import { useUser } from '../hooks/use-user.ts';
import Login from './login.tsx';
import Register from './register.tsx';
import { isExpired } from 'react-jwt';
import { Students } from './students.tsx';
// import { Users } from './users.tsx';
import { Planner } from './planner.tsx';
import { Admin } from './admin-panel.tsx';
import UserList from './user-list.tsx';
import AddPlanner from './add-planner.tsx';



export default function Routes() {
  const { token } = useUser();

  // Define public routes accessible to all users
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

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
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
          path: '/students',
          element: <Students />,
        },
        // {
        //   path: '/users',
        //   element: <Users />,
        // },
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
        }        
      ],
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token || isExpired(token) ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  console.log(router);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
}
