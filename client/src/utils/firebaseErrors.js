import { FirebaseError } from "firebase/app";

const CustomFirebaseError = (errorCode) => {
  switch (errorCode) {
      case 'auth/email-already-exists':
      case 'auth/email-already-in-use':
          return "The email you entered is already in use. Try login in instead.";
      case 'auth/invalid-email':
          return "The email you entered is invalid. Please check and try again.";
      case 'auth/operation-not-allowed':
          return "This sign-in method is not allowed. Please contact support.";
      case 'auth/invalid-password':
          return "Your password is invalid. It should be at least six characters.";
      case 'auth/user-not-found':
          return "No account found with this email. Try create one instead.";
      case 'auth/too-many-requests':
          return "Too many unsuccessful login attempts. Please try again later.";
      case 'auth/wrong-password':
          return "Incorrect password. Please check and try again.";
      case 'auth/account-exists-with-different-credential':
          return "An account exists with a different sign-in method. Try another sign-in method or reset your password.";
      case 'auth/popup-closed-by-user':
          return "The sign-in window was closed. Please try again.";
      default:
          return "An error occurred. Please try again.";
  }
}

export default CustomFirebaseError;