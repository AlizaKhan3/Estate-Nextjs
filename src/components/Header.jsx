import { NAV_LINKS } from "@/app/constants";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Header = () => {
    return (
        <header className="bg-slate-200 shadow-md">

            <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
                <Link href="/">
                    <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
                        <span className="text-green-600">Khan</span>
                        <span className="text-green-900">Estate</span>
                    </h1>
                </Link>
                <form className="bg-slate-100 p-3 rounded-lg flex items-center">
                    <input type="text" placeholder="Search here" className="bg-transparent focus:outline-none w-24 sm:w-64" />
                    <button>
                        <p>search</p>
                        {/* <FaSearch className="text-slate-600"/> */}
                    </button>
                </form>
                <ul className="flex gap-4">
                    {
                        NAV_LINKS.map((link) => {
                            return <Link href={link.href} key={link.key}><li className="hidden md:inline text-slate-700 hover:underline">{link.label}</li></Link>
                        })
                    }
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <Link href="/sign-in"><li className="hidden md:inline text-slate-700 hover:underline">Sign In</li></Link>
                    </SignedOut>
                </ul>

            </div>
        </header>
    )
}

export default Header;