/**
 * Translates Firebase Authentication error codes to clean, actionable user-facing messages.
 */
export function getFirebaseErrorMessage(error) {
  if (!error) return 'An error occurred. Please try again.';
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please create an account first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup window was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled by another action.';
    case 'auth/popup-blocked':
      return 'The login popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'This authentication provider is not enabled in your Firebase Console (Authentication > Sign-in method).';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Firebase API key in .env is a placeholder or invalid. To use live Google/Facebook authentication, please provide your real Firebase project keys in your .env file.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains). Add "localhost" to test locally.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Please sign in using your original provider.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}
