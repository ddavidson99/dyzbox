import { auth } from "@/app/auth";

/**
 * Wrapper for the auth function from Next Auth v5
 * 
 * @see https://nextjs.org/docs/authentication
 */
export const getServerAuthSession = auth; 