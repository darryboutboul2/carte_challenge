# Firebase Authentication Setup

## Steps to Enable Authentication

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com/
   - Select your project "carte-challenge"

2. **Enable Authentication**
   - In the left sidebar, click on "Authentication"
   - If you see a "Get started" button, click it
   - If Authentication is already enabled, proceed to step 3

3. **Configure Sign-in Methods**
   - Go to the "Sign-in method" tab
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

4. **Verify Setup**
   - You should now see "Email/Password" as "Enabled" in the sign-in methods list
   - The authentication service is now ready to use

## Additional Configuration (Optional)

### Email Verification
- In the "Templates" tab, you can customize email verification templates
- For development, you can disable email verification requirements

### Authorized Domains
- In the "Settings" tab, add your domains to the authorized domains list
- For local development, `localhost` should already be included

## Testing the Setup

After enabling authentication, try logging in again with the admin credentials. The `auth/configuration-not-found` error should be resolved.

If you continue to have issues, check:
1. That your Firebase project ID matches the one in your configuration
2. That the API key has the necessary permissions
3. That your project has the Authentication service enabled (not just configured)

## Creating Your First Admin User

Once authentication is working, you can either:
1. Use the registration form in your app to create the first admin
2. Create a user manually in the Firebase Console under Authentication > Users