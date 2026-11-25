import { SignIn } from '@clerk/react'

export default function Login() {
    return (
        <div className="mx-auto my-12 flex w-full max-w-md justify-center px-4">
            <SignIn routing="hash" signUpUrl="/SignUp" forceRedirectUrl="/Home" />
        </div>
    )
}