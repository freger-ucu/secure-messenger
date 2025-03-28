import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Button, Alert } from "antd";
const { TextArea } = Input;

export default function SeedPhraseRestoration() {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock database for existing seed phrase
  const existingSeedPhrase = "apple banana cherry date elderberry fig";

  // Handle the form submission
  const handleRestore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get the seed phrase from the textarea
    const fullSeedPhrase = seedPhrase.trim();

    // Validate the seed phrase input (must be exactly 6 words)
    const words = fullSeedPhrase.split(/\s+/);
    if (words.length !== 6) {
      setError("Seed phrase must contain exactly 6 words.");
      setLoading(false);
      return;
    }

    // Simulate checking the seed phrase against the database
    if (fullSeedPhrase === existingSeedPhrase) {
      // Proceed with password update and login
      console.log("Seed phrase matches. Updating password...");
      // Logic to update password in DB can be implemented here.

      // After successful restoration, redirect to the login page
      navigate("/login");
    } else {
      setError("Seed phrase does not match our records.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h2 className="text-3xl font-bold mb-4">Seed Phrase Restoration</h2>

      {/* Form for Seed Phrase and New Password */}
      <form onSubmit={handleRestore} className="w-full max-w-xl space-y-6">
        {/* Seed Phrase TextArea */}
        <div className="mb-4">
          <label
            htmlFor="seedPhrase"
            className="block text-sm font-medium mb-2"
          >
            Enter your 6-word seed phrase
          </label>
          <TextArea
            id="seedPhrase"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            placeholder="Enter your seed phrase (6 words separated by spaces)"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
          />
          <p className="mt-1 text-sm text-gray-500">
            Please enter all 6 words of your seed phrase, separated by spaces.
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

          <Button type="link" onClick={() => navigate("/login")} size="large">
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  );
}
