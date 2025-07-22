import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // ✅ Fixed: initialized as empty string
  const [password, setPassWord] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login(currState === "Sign Up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* left  */}
      <img
        src={assets.logo_big}
        alt="QuickChat logo"
        className="w-[min(30vw,250px)]"
      />

      {/* right  */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back arrow"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full Name"
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Email Address"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              onChange={(e) => setPassWord(e.target.value)}
              value={password}
              placeholder="Password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            rows={4}
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500"
            placeholder="Give us a short bio"></textarea>
        )}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer">
          {currState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" id="terms" />
          <label htmlFor="terms" className="cursor-pointer">
            <p>Agree to terms of use & privacy policy</p>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <span
                className="font-medium text-violet-500 cursor-pointer"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}>
                Login here
              </span>
              .
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Create an account{" "}
              <span
                className="font-medium text-violet-500 cursor-pointer"
                onClick={() => setCurrState("Sign Up")}>
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
