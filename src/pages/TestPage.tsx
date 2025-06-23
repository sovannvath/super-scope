import React from "react";

const TestPage: React.FC = () => {
  console.log("🧪 TestPage component is rendering!");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-4">Test Page</h1>
      <p className="text-lg">
        This is a test page to verify routing is working.
      </p>
      <p className="text-sm text-gray-600 mt-4">
        If you can see this, then React Router is working correctly.
      </p>
    </div>
  );
};

export default TestPage;
