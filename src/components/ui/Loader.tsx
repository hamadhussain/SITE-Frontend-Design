import { useEffect, useState } from 'react'

export default function Loader({ isLoading }: { isLoading: boolean }) {
    const [show, setShow] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isLoading) {
            setProgress(100)
            return
        }

        const duration = 2500
        const interval = 20
        const steps = duration / interval
        let currentStep = 0

        const timer = setInterval(() => {
            currentStep++
            // cubic ease-out
            const progressFraction = 1 - Math.pow(1 - currentStep / steps, 3)
            const newProgress = Math.min(Math.round(progressFraction * 100), 99)
            setProgress(newProgress)

            if (currentStep >= steps) {
                clearInterval(timer)
            }
        }, interval)

        return () => clearInterval(timer)
    }, [isLoading])

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => setShow(false), 800) // Accounts for transition duration
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    if (!show) return null

    return (
        <div
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="flex flex-col items-center max-w-sm w-full px-6">

                {/* Animated Icon */}
                <div className="mb-10 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full blur-2xl bg-primary/30 animate-pulse duration-1000"></div>

                    <div className="relative h-24 w-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary/80 animate-[spin_1.5s_linear_infinite]"></div>
                        <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-primary/60 animate-[spin_2s_linear_infinite_reverse]"></div>
                        <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-pulse">
                            <div className="h-4 w-4 bg-background rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Text & Percentage */}
                <div className="flex items-end justify-between w-full mb-3">
                    <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase flex items-center">
                        Loading
                        <span className="flex ml-1">
                            <span className="animate-[bounce_1.4s_infinite_0s] inline-block mx-0.5">.</span>
                            <span className="animate-[bounce_1.4s_infinite_0.2s] inline-block mx-0.5">.</span>
                            <span className="animate-[bounce_1.4s_infinite_0.4s] inline-block mx-0.5">.</span>
                        </span>
                    </h2>
                    <span className="text-lg font-mono font-medium text-foreground/90">
                        {progress}%
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden relative">
                    {/* Animated Progress Bar */}
                    <div
                        className="h-full bg-primary transition-all duration-100 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="mt-6 text-sm tracking-[0.2em] text-muted-foreground uppercase opacity-80 animate-pulse duration-1000">
                    Preparing Application
                </p>
            </div>
        </div>
    )
}
