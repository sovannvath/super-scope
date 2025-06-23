// API Testing Utility
export const testApi = async () => {
  const baseUrl = "https://laravel-wtc.onrender.com/api";

  try {
    console.log("🧪 Testing API endpoints...");

    // Test products endpoint
    const response = await fetch(`${baseUrl}/products`);
    console.log("📡 Products API Status:", response.status);
    console.log(
      "📡 Products API Headers:",
      Object.fromEntries(response.headers),
    );

    const data = await response.json();
    console.log("📡 Products API Data:", data);
    console.log("📡 Data Type:", typeof data);
    console.log("📡 Is Array:", Array.isArray(data));

    if (data && typeof data === "object") {
      console.log("📡 Data Keys:", Object.keys(data));
      if (data.data) {
        console.log("📡 data.data Type:", typeof data.data);
        console.log("📡 data.data Is Array:", Array.isArray(data.data));
        if (Array.isArray(data.data)) {
          console.log("📡 Products Count:", data.data.length);
          console.log("📡 First Product:", data.data[0]);
        }
      }
    }

    return data;
  } catch (error) {
    console.error("❌ API Test Error:", error);
    return null;
  }
};

// Call this function in console: testApi()
(window as any).testApi = testApi;
