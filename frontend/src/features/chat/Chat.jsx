import { clearTokens } from "../../utilities/auth";
import { useNavigate } from "react-router"; // Fix import
import { Button } from "antd";

export default function Chat() {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogout = () => {
    clearTokens(); // Clear tokens from storage
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div>
      <div>Chat</div>
      <Button size="large" danger onClick={handleLogout}>Logout</Button> {/* Add a logout button */}
    </div>
  );
}
