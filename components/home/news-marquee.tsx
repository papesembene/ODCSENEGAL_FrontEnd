// components/home/news-marquee.tsx
"use client"
 
import React from "react"
import Marquee from "react-fast-marquee"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
 
interface NewsItem {
  id: string
  title: string
  slug: string
  linkUrl?: string
  isBreaking?: boolean
  category?: string
}
 
interface Props {
  news: NewsItem[]
}
 
export default function NewsMarquee({ news }: Props) {
  const hasNews = news.length > 0;
 
  return (
    <div className="relative bg-linear-to-r/srgb from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900 dark:via-amber-900 dark:to-orange-900 border-y border-orange-200/50 dark:border-orange-800/50 py-3 overflow-hidden group">
     
      {/* Bandeau Breaking News fixe */}
      <div className="absolute left-0 top-0 h-full flex items-center z-10 bg-linear-to-r/srgb from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-900 w-28 sm:w-36 md:w-44 px-2 sm:px-4 shadow-md">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 fill-orange-500 stroke-orange-700 dark:fill-orange-300 dark:stroke-orange-100 animate-pulse" />
          <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-orange-700 dark:text-orange-200 whitespace-nowrap">
            Breaking News
          </span>
          <div className="h-3 sm:h-4 w-px bg-orange-300 dark:bg-orange-600 mx-1 sm:mx-2"></div>
        </div>
      </div>
 
      {/* Marquee principal */}
      <Marquee
        pauseOnHover
        gradient={false}
        speed={45}
        className="pl-28 sm:pl-36 md:pl-44"
      >
        {hasNews ? (
          news.map((item) => (
            <React.Fragment key={item.id}>
              <Link
                href={item.linkUrl || `/actualites/${item.slug}`}
                className="mx-6 flex items-center group/news-item"
              >
                {item.category && (
                  <span className="text-xs font-semibold bg-orange-200/30 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full mr-3">
                    {item.category}
                  </span>
                )}
                <span
                  className={`text-sm md:text-base leading-tight ${
                    item.isBreaking
                      ? "font-bold text-orange-700 dark:text-orange-100 underline decoration-orange-400 decoration-2 underline-offset-4"
                      : "font-medium text-orange-800/90 dark:text-orange-200/90 hover:text-orange-700 dark:hover:text-orange-100"
                  }`}
                >
                  {item.title}
                </span>
                <ArrowRight className="ml-2 h-3.5 w-3.5 text-orange-600 dark:text-orange-300 opacity-0 group-hover/news-item:opacity-100 translate-x-[-4px] group-hover/news-item:translate-x-0 transition-all duration-300" />
              </Link>
              <div className="flex items-center px-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-300 dark:bg-orange-600 animate-pulse"></div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="text-sm md:text-base font-medium text-orange-700 dark:text-orange-200 px-6">
             Aucun événement prévu pour le moment. Restez connectés !
          </div>
        )}
      </Marquee>
 
      {/* Badge LIVE */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-ping"></div>
        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">LIVE</span>
      </div>
    </div>
  );
}
 
 
 
