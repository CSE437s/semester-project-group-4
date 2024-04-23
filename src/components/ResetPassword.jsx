import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust the path as necessary

function ResetPassword() {
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        const newPassword = prompt("What would you like your new password to be?");
        if (newPassword) {
          const { data, error } = await supabase.auth.updateUser({ password: newPassword });

          if (data) {
            alert("Password updated successfully!");
            // Optionally redirect or update UI state
          }
          if (error) {
            alert("There was an error updating your password.");
          }
        }
      }
    });
  }, []);

  return (
    <div>
      <h1>Password Reset</h1>
      <p>Please check your email for the password reset link.</p>
    </div>
  );
}

export default ResetPassword;