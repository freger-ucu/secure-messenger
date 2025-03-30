import React from "react";
import { Button } from "antd";
import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-2">Oops! Page not found.</p>
      <Link to="/">
        <Button type="primary" className="mt-4">
          Go Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
