import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
import { authApi } from '../api/endpoints';
import { setAuth } from '../store/authSlice';

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateField = async (field: string, value: string) => {
    try {
      await schema.validateAt(field, {
        email,
        password,
        [field]: value,
      });
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    try {
      await schema.validate({ email, password }, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const errors: { email?: string; password?: string } = {};
        validationError.inner.forEach(err => {
          if (err.path) errors[err.path as keyof typeof errors] = err.message;
        });
        setFieldErrors(errors);
        return;
      }
    }

    setLoading(true);
    try {
      const data = await authApi.login(email.toLowerCase(), password);
      dispatch(setAuth(data));
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
      {/* Left: image panel */}
      <div className="relative hidden overflow-hidden md:flex md:w-1/2">
        <img
          src="img/Login.webp"
          alt="login background"
          className="absolute inset-0 object-cover w-full h-full"
        />
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center max-md:justify-center md:justify-start px-5 md:px-[100px] py-20 bg-[#f0f6ff]">
        <div className="w-full max-w-[350px]">
          <h1 className="mb-5 font-serif text-[28px] font-bold text-navy">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm text-black font-bold mb-1.5 tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  void validateField('email', e.target.value);
                }}
                className={`w-full px-4 py-3 font-normal text-sm bg-[#e0e0e0] border rounded text-navy focus:outline-none focus:border-gold/80 placeholder:text-gray-400 ${
                  fieldErrors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold tracking-wide text-black">
                  Password
                </label>
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  void validateField('password', e.target.value);
                }}
                className={`w-full px-4 py-3 font-normal mb-1 text-sm bg-[#e0e0e0] border rounded text-navy focus:outline-none focus:border-gold/80 placeholder:text-gray-400 ${
                  fieldErrors.password ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {fieldErrors.password && (
                <p className="mb-1 text-xs text-red-500">
                  {fieldErrors.password}
                </p>
              )}
              <div className="flex justify-end items-center mb-2.5">
                <button
                  type="button"
                  className="text-sm font-normal transition-colors text-gold hover:text-gold-dark"
                  aria-label="Forgot password?"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-bold tracking-wide text-white transition-colors border rounded border-gold bg-gold hover:text-gold hover:bg-transparent disabled:opacity-60"
              aria-label="Log in to your account"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-2.5 text-sm text-center text-navy/50">
            Don't have account?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors text-gold hover:text-gold-dark"
              aria-label="Sign up for a new account"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
