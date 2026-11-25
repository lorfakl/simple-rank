import AuthenticationOptions from '../components/AuthenticationOptions'

export default function Login() {
    return (
        <div className="mx-auto my-12 w-full max-w-md px-4">
            <AuthenticationOptions isSignUp={false} />
        </div>
    )
}