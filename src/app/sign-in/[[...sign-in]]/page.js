import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='flex p-4 items-center justify-center'>
            <SignIn />
        </div>
    )
}