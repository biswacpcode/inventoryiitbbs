import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { checkExistence, CreateNewUser, getUserId }from "./actions";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase() ?? "";
      const emailDomain = email.split("@")[1];
  
      // Restrict email domain
      if (emailDomain !== "iitbbs.ac.in") {
        return false; // Reject sign-in
      }
  
      let role = "Student";
  
      // Determine user role
      if (email.includes("secy")) {
        role = "Society";
      } else if (email.includes("gsec")) {
        role = "Council";
      } else if (email.includes("22mm01002")) {
        role = "Manager";
      }
  
      if (email === "secyweb.sg@iitbbs.ac.in" || email === "president.sg@iitbbs.ac.in") {
        role = "Admin";
      }
  
      try {
        // Check if the user exists in the database
        const response = await checkExistence(email);
        if (!response) {
          // Create a new user if not found
          await CreateNewUser(user.name!, email, user.image!, role);
        }
  
        // Allow sign-in
        return true;
      } catch (error) {
        console.error("Error managing user in Appwrite:", error);
  
        // Reject sign-in on error
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.sub; // Use Google's user ID
      }
      return token;
    },
    async session({ session, token }) {
      // Add `id` to session.user
      session.user.id = token.id as string;
  
      if (session.user.email) {
        const userId = await getUserId(session.user.email);
        session.user.id = userId;
      }
  
      return session;
    },
  }
  
};