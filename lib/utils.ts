import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getISTTime = () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

export const formatISTDate = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const formatISTDateTime = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatISTTime = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  })
}