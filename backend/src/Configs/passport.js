import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import { GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID } from "../constant.js";
import { translateTexts } from "../Services/translator.service.js";

// Batch process both names together
const processNames = async (firstName, lastName) => {
      try {
            const translatedNames = await translateTexts([firstName, lastName]);

            return {
                  firstName: {
                        en: firstName,
                        ar: translatedNames[0],
                  },
                  lastName: {
                        en: lastName,
                        ar: translatedNames[1],
                  },
            };
      } catch (error) {
            console.error("Translation error:", error.message);
            return {
                  firstName: { en: firstName },
                  lastName: { en: lastName },
            };
      }
};

passport.use(
      new GoogleStrategy(
            {
                  clientID: GOOGLE_CLIENT_ID,
                  clientSecret: GOOGLE_CLIENT_SECRET,
                  callbackURL: "https://crap.ninja/api/v1/user/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                  try {
                        let user = await User.findOne({
                              $or: [
                                    { googleId: profile.id },
                                    { email: profile.emails?.[0]?.value },
                              ],
                        });

                        const profilePicture =
                              profile.photos?.[0]?.url || profile.photos?.[0]?.value || "";

                        if (!user) {
                              const { firstName, lastName } = await processNames(
                                    profile.name?.givenName || "",
                                    profile.name?.familyName || ""
                              );
                              user = new User({
                                    googleId: profile.id,
                                    firstName,
                                    lastName,
                                    email: profile.emails?.[0]?.value || "",
                                    image: { url: profilePicture, key: "" },
                                    isEmailVerified: true, // Google emails are verified
                                    lastLogin: Date.now(),
                              });
                              await user.save();
                        } else {
                              user.lastLogin = Date.now();
                              await user.save();
                        }

                        // Generate access & refresh tokens
                        const accessToken = user.generateAccessToken();
                        const refreshToken = user.generateRefreshToken();

                        done(null, { accessToken, refreshToken, user });
                  } catch (err) {
                        done(err, null);
                  }
            }
      )
);

export default passport;