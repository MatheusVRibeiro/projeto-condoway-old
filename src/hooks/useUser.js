import { useAuth } from '../contexts/AuthContext';

export default function useUser() {
  const { user, isLoggedIn } = useAuth();
  return { user, isLoggedIn };
}
