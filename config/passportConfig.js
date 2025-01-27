import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();


passport.use(  
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:7000/auth/google/callback',
    }, 
    async (accessToken, refreshToken, profile, done) => { 
      try {
        
        
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const initialPassword = Math.random().toString(36).slice(-8); 
          const hashedPassword = await bcrypt.hash(initialPassword, 10);
          const refCode = `Ref${Date.now()}`;
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            refCode,
            password: hashedPassword,
          });

         await user.save().then((data)=>{
            req.session.user=data
           
           })

           
           
        
        }

        return done(null, user); 
      } catch (err) {
        console.error('Error During Google Login:', err);
        return done(err, null); 
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); 
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
