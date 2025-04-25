import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Button, Alert, Form } from "antd";
const { TextArea } = Input;

// Component for the initial username input screen
function UsernameEntry({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setLoading(true);
    onSubmit(username);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h2 className="text-3xl font-bold mb-4">Account Recovery</h2>
      <p className="mb-6 text-center">
        Enter your username to start the recovery process
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
          />
        </div>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" />
        )}

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          block
        >
          Continue
        </Button>
      </form>
    </div>
  );
}

export default function SeedPhraseRestoration() {
  const [username, setUsername] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("username"); // "username" or "restore"
  const navigate = useNavigate();

  const handleUsernameSubmit = (username) => {
    setUsername(username);
    setStep("restore");
  };

  // Handle the form submission
  const handleRestore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Get the seed phrase from the textarea
    const fullSeedPhrase = seedPhrase.trim();

    // Validate the seed phrase input (not empty)
    if (!fullSeedPhrase) {
      setError("Seed phrase cannot be empty");
      setLoading(false);
      return;
    }
    const API_BASE = process.env.API_URL;

    try {
      // Make API call to the backend with PUT method as required
      const response = await fetch(
        `http://${API_BASE}/auth/restore/${username}/`,
        {
          method: "PUT", // Changed from POST to PUT based on backend requirements
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: newPassword,
            password2: confirmPassword,
            seedphrase: fullSeedPhrase,
          }),
        }
      );

      // For 204 No Content responses
      if (response.status === 204) {
        console.log("Account restored successfully");
        navigate("/login");
        return;
      }

      // For responses with JSON body
      try {
        const data = await response.json();

        if (response.ok) {
          // Success - redirect to login page
          console.log("Account restored successfully");
          navigate("/login");
        } else {
          // Handle error response from API
          setError(
            data.detail ||
              "Failed to restore account. Please check your seed phrase."
          );
          setLoading(false);
        }
      } catch (jsonError) {
        // If the response is not JSON parseable but was successful
        if (response.ok) {
          console.log("Account restored successfully");
          navigate("/login");
        } else {
          setError("An error occurred. Please try again.");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("API call failed:", err);
      setError("Network error. Please try again later.");
      setLoading(false);
    }
  };

  // If we're on the username entry step
  if (step === "username") {
    return <UsernameEntry onSubmit={handleUsernameSubmit} />;
  }

  // If we're on the seed phrase restoration step
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">Seed Phrase Restoration</h2>
      <p className="mb-4">
        Restoring account for: <strong>{username}</strong>
      </p>

      {/* Form for Seed Phrase and New Password */}
      <form onSubmit={handleRestore} className="w-full max-w-xl space-y-6">
        {/* Seed Phrase TextArea */}
        <div className="mb-4">
          <label
            htmlFor="seedPhrase"
            className="block text-sm font-medium mb-2"
          >
            Enter your seed phrase
          </label>
          <TextArea
            id="seedPhrase"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            placeholder="Enter your seed phrase (words separated by spaces)"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Please enter your seed phrase exactly as it was provided to you,
            with words separated by spaces.
          </p>
        </div>

        {/* New Password Input */}
        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium mb-2"
          >
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-2"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Error message */}
        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
          >
            Restore Account
          </Button>

          <Button
            type="default"
            onClick={() => setStep("username")}
            size="large"
          >
            Back to Username Entry
          </Button>

          <Button type="link" onClick={() => navigate("/login")} size="large">
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  );
}
