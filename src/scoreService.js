import { supabase } from './supabaseClient';

export async function submitGameScore(gameName, score) {
  // 1. Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.warn('Player is not logged in. Score will not be saved.');
    return { error: 'Not logged in' };
  }

  const user = session.user;
  // Use the username saved during signup, or fallback to email prefix
  const username = user.user_metadata?.username || user.email.split('@')[0];

  // 2. Insert record into the Supabase leaderboard table
  const { data, error } = await supabase.from('leaderboard').insert([
    {
      user_id: user.id,
      username: username,
      game: gameName,
      score: score,
    },
  ]);

  if (error) {
    console.error('Failed to submit score:', error.message);
    return { error };
  }

  console.log(`Score of ${score} submitted successfully for ${username}!`);
  return { success: true, data };
}