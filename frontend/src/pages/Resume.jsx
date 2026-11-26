/**
 * Legacy /resume URL — resume scoring lives on the Profile tab now.
 */
import { Navigate } from 'react-router-dom';

export default function Resume() {
  return <Navigate to="/profile?tab=resume" replace />;
}