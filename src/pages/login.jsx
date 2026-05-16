import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#edf7f3] flex items-center justify-center px-4">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-4xl font-bold text-center text-blue-600">
          Welcome to Acadesk
        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">
          Your collaborative study companion
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>

        </div>
      </div>
    </div>
  );
}