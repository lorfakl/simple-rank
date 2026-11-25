import { Link, useLocation } from 'react-router';
import { SignIn, SignUp } from '@clerk/react';
import { Medal } from 'lucide-react';
import { buildAuthPath, getPostAuthReturnPath } from '../auth/returnPath';

function AuthenticationOptions({ isSignUp }: { isSignUp: boolean }) {
  const location = useLocation();
  const returnPath = getPostAuthReturnPath(location.search, window.sessionStorage);
  const loginUrl = buildAuthPath('/Login', returnPath);
  const signUpUrl = buildAuthPath('/SignUp', returnPath);

  return (
    <>
      <div className="flex justify-center items-center gap-3 mb-8">
        <span className="flex items-center justify-center rounded-xl bg-primary p-3 shadow-soft">
          <Medal className="w-8 h-8 text-primary-content" />
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-base-content">
          simple rank
        </h1>
      </div>

      <div className="my-6 flex justify-center">
        {isSignUp
          ? <SignUp routing="hash" signInUrl={loginUrl} forceRedirectUrl={returnPath} />
          : <SignIn routing="hash" signUpUrl={signUpUrl} forceRedirectUrl={returnPath} />}
      </div>

      <p className="mb-4 text-center text-xs text-base-content/60">
        by continuing you agree to our{' '}
        <Link className="link link-primary" to="/terms">terms of service</Link>
        {' '}and{' '}
        <Link className="link link-primary" to="/privacy">privacy policy</Link>.
      </p>
    </>
  );
}

export default AuthenticationOptions
