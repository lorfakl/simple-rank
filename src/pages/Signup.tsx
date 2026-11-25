import { SignUp } from '@clerk/react'

export default function Signup() {
    return (
        <div className="mx-auto my-12 flex w-full max-w-md justify-center px-4">
            <SignUp routing="hash" signInUrl="/Login" forceRedirectUrl="/Home" />
        </div>
    )
}