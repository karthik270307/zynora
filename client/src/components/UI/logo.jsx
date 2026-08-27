function Logo() {
    return (
        <div className="flex items-center gap-3">

            <div
                className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-indigo-600
                    to-violet-600
                    text-white
                    shadow-lg
                    shadow-indigo-200
                "
            >
                <span className="text-lg font-bold">
                    C
                </span>
            </div>

            <div>
                <h1 className="text-[15px] font-bold tracking-tight text-slate-900">
                    CreativeIQ
                </h1>

                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    AI Marketing
                </p>
            </div>

        </div>
    );
}

export default Logo;