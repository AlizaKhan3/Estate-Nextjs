import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='flex p-4 items-center justify-center'>
            <SignUp />
        </div>
    )
}