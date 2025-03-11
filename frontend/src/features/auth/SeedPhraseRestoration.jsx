import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Button, Alert } from "antd";

export default function SeedPhraseRestoration() {
  const [seedPhrase, setSeedPhrase] = useState({
    word1: "",
    word2: "",
    word3: "",
    word4: "",
    word5: "",
    word6: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock database for existing seed phrase
  const existingSeedPhrase = "apple banana cherry date elderberry fig grape";

  // Handle the form submission
  const handleRestore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Combine the words into a full seed phrase
    const fullSeedPhrase = `${seedPhrase.word1} ${seedPhrase.word2} ${seedPhrase.word3} ${seedPhrase.word4} ${seedPhrase.word5} ${seedPhrase.word6}`;

    // Validate the seed phrase input (must be exactly 6 words)
    const words = fullSeedPhrase.trim().split(" ");
    if (words.length !== 6) {
      setError("Seed phrase must contain exactly 6 words.");
      setLoading(false);
      return;
    }

    // Simulate checking the seed phrase against the database
    if (fullSeedPhrase.trim() === existingSeedPhrase) {
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
      <form onSubmit={handleRestore} className="w-full max-w-xl space-y-2">
        {/* First Row of 3 Blocks */}
        <div className="flex space-x-2 mb-6">
          <div className="w-1/3">
            <Input
              type="text"
              value={seedPhrase.word1}
              onChange={(e) =>
                setSeedPhrase({ ...seedPhrase, word1: e.target.value })
              }
              placeholder="Enter word 1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            />
          </div>
          <div className="w-1/3">
            <Input
              type="text"
              value={seedPhrase.word2}
              onChange={(e) =>
                setSeedPhrase({ ...seedPhrase, word2: e.target.value })
              }
              placeholder="Enter word 2"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            />
          </div>
          <div className="w-1/3">
            <Input
              type="text"
              value={seedPhrase.word3}
              onChange={(e) =>
                setSeedPhrase({ ...seedPhrase, word3: e.target.value })
              }
              placeholder="Enter word 3"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Second Row of 3 Blocks */}
        <div className="flex space-x-2 mb-6">
          <div className="w-1/3">
            <Input
              type="text"
              value={seedPhrase.word4}
              onChange={(e) =>
                setSeedPhrase({ ...seedPhrase, word4: e.target.value })
              }
              placeholder="Enter word 4"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            />
          </div>
          <div className="w-1/3">
            <Input
              type="text"
              value={seedPhrase.word5}
              onChange={(e) =>
                setSeedPhrase({ ...seedPhrase, word5: e.target.value })
              }
              placeholder="Enter word 5"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            />
          </div>
          <div className="w-1/3">
            <Input
              type="text"
              value={seedPhrase.word6}
              onChange={(e) =>
                setSeedPhrase({ ...seedPhrase, word6: e.target.value })
              }
              placeholder="Enter word 6"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* New Password Input */}
        <div className="mb-4">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="block w-full px-4 py-2 border-2 border-gray-300 rounded-md"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          block
        >
          Restore Account
        </Button>
      </form>

      {/* Error message */}
      {error && <Alert message={error} type="error" showIcon />}

      {/* Button to go back to login */}
      <Button
        type="link"
        onClick={() => navigate("/login")}
        size="large"
        style={{ marginTop: "20px" }}
      >
        Back to Login
      </Button>
    </div>
  );
}
