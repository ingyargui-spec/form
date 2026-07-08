import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '@/firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use Google Auth Provider with sheets and drive.file scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");

// Configure the provider to prompt for account selection if needed
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Flag to indicate if sign-in is in progress
let isSigningIn = false;

// In-memory token cache
let cachedAccessToken: string | null = null;

// Initialize auth state observer
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no cached token, the token might be lost on hard-refresh
        // We will trigger re-authentication via popup, or prompt sign-in
        if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and retrieve the Access Token
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error("Impossible de récupérer le jeton d'accès Google Drive/Sheets.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve cached access token or return null
export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

// Manually set access token (useful if we restore it or pass it)
export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

// Log out user
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
