import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = true, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={twMerge(
                    "bg-white rounded-2xl p-6 shadow-sm border border-slate-100",
                    hoverEffect && "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/20",
                    className
                )}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

export { Card }
