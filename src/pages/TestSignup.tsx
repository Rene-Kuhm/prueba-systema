import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSignup() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleTestSignup() {
    setLoading(true);
    setResult(''); // Clear previous results
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'test123456';

      // Test user registration
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        throw new Error(`SignUp Error: ${signUpError.message}`);
      }

      if (!authData?.user) {
        throw new Error('User registration failed. No user returned.');
      }

      // Test profile creation
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: 'Test User',
          role: 'technician',
          approved: false,
        },
      ]);

      if (profileError) {
        throw new Error(`Profile Error: ${profileError.message}`);
      }

      setResult(`✅ Success! User registered with email: ${testEmail}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setResult(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center text-gray-800">Test Signup</h2>
        <button
          onClick={handleTestSignup}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Signup'}
        </button>
        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
