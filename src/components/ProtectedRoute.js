import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element, ...props }) {
  return props.loggedIn ? element : <Navigate to="/sing-in" replace />;
}

export default ProtectedRoute;
